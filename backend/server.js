import 'dotenv/config';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { MongoClient } from 'mongodb';
import { promisify } from 'node:util';
import { publicVapidKey } from './services/pushService.js';
import { startNotificationCron } from './jobs/notificationCron.js';

const scrypt = promisify(scryptCallback);
const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const sessionLifetime = 30 * 24 * 60 * 60 * 1000;
const priorityStars = { high: 3, medium: 2, low: 1 };
const mongoUri = process.env.MONGODB_URI;
const frontendOrigins = new Set([
  'https://focus-buddy-one.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean)
]);

if (!mongoUri) throw new Error('MONGODB_URI is required. Set it in the environment or .env.');

const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 30000, connectTimeoutMS: 30000, retryWrites: true, retryReads: true });
await client.connect();
const mongo = client.db(process.env.MONGODB_DB || 'diva');
const users = mongo.collection('users');
const sessions = mongo.collection('sessions');
const workspaces = mongo.collection('workspaces');
const progressRecords = mongo.collection('progress');
const settingsRecords = mongo.collection('settings');
const reminders = mongo.collection('reminders');
const notificationHistory = mongo.collection('notifications');
const joinRequests = mongo.collection('joinRequests');

await Promise.all([
  users.createIndex({ email: 1 }, { unique: true }),
  sessions.createIndex({ tokenHash: 1 }, { unique: true }),
  sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  workspaces.createIndex({ code: 1 }, { unique: true, partialFilterExpression: { code: { $type: 'string' } } }),
  reminders.createIndex({ workspaceId: 1 }),
  reminders.createIndex({ creatorUserId: 1, status: 1, dueAt: 1, notificationSentAt: 1 }),
  notificationHistory.createIndex({ reminderId: 1 }, { unique: true }),
  notificationHistory.createIndex({ recipientUserId: 1, createdAt: -1 }),
  joinRequests.createIndex({ workspaceId: 1, status: 1, createdAt: 1 }),
  joinRequests.createIndex({ requesterUserId: 1, status: 1 })
]);

await progressRecords.updateMany(
  { stars: 42, weekCount: 12, completed: 18, missed: 2, rescheduled: 3, reliability: 87 },
  {
    $set: { stars: 0, weekCount: 0, completed: 0, missed: 0, rescheduled: 0, reliability: 0 },
    $unset: { missedStatus: '', secretUnlocked: '' }
  }
);

function id() {
  return randomBytes(16).toString('hex');
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, ...(user.avatar ? { avatar: user.avatar } : {}) };
}

function publicWorkspace(workspace, userId) {
  const membership = workspace.members.find((member) => member.userId === userId);
  return {
    id: workspace._id,
    mode: workspace.mode,
    name: workspace.name,
    code: workspace.code,
    members: workspace.mode === 'personal' ? 1 : workspace.members.length,
    role: membership?.role ?? null,
    ...(workspace.category ? { category: workspace.category } : {})
  };
}

function withoutMongoId(document) {
  if (!document) return document;
  return Object.fromEntries(Object.entries(document).filter(([key]) => key !== '_id'));
}

async function ensureProgress(userId) {
  await progressRecords.updateOne(
    { _id: userId },
    { $setOnInsert: { stars: 0, weekCount: 0, completed: 0, missed: 0, rescheduled: 0, reliability: 0 } },
    { upsert: true }
  );
  return progressRecords.findOne({ _id: userId });
}

function send(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(value));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1024 * 1024) {
      const error = new Error('Request body is too large');
      error.status = 413;
      throw error;
    }
  }
  if (!body) return {};
  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Request body must be a JSON object');
    return parsed;
  } catch {
    const error = new Error('Request body must be valid JSON');
    error.status = 400;
    throw error;
  }
}

function requireText(value, label, maximum = 200) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum) {
    const error = new Error(`${label} is required and must be at most ${maximum} characters`);
    error.status = 400;
    throw error;
  }
  return value.trim();
}

async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const derived = await scrypt(password, salt, 64);
  return { passwordSalt: salt, passwordHash: derived.toString('hex') };
}

async function verifyPassword(password, user) {
  const derived = await scrypt(password, user.passwordSalt, 64);
  const expected = Buffer.from(user.passwordHash, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

async function authenticate(request) {
  const authorization = request.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const session = await sessions.findOne({ tokenHash: tokenHash(match[1]), expiresAt: { $gt: new Date() } });
  return session ? users.findOne({ _id: session.userId }) : null;
}

async function createSession(user) {
  const token = randomBytes(32).toString('base64url');
  await sessions.insertOne({ tokenHash: tokenHash(token), userId: user._id, expiresAt: new Date(Date.now() + sessionLifetime) });
  return token;
}

async function memberWorkspace(workspaceId, userId) {
  const workspace = await workspaces.findOne({ _id: workspaceId, 'members.userId': userId });
  if (!workspace) {
    const error = new Error('Workspace not found');
    error.status = 404;
    throw error;
  }
  return workspace;
}

async function makeTeamCode(name) {
  const prefix = name.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X');
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `${prefix}-${(randomBytes(2).readUInt16BE(0) % 10000).toString().padStart(4, '0')}`;
    if (!await workspaces.findOne({ code })) return code;
  }
  throw new Error('Could not generate a unique team code');
}

async function handle(request, response) {
  const url = new URL(request.url, 'http://localhost');
  const method = request.method || 'GET';
  const path = url.pathname.replace(/\/$/, '') || '/';
  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(request) : {};

  if (method === 'GET' && path === '/api/health') return send(response, 200, { status: 'ok', database: 'connected' });

  // Public endpoint – no auth required (frontend needs it before login)
  if (method === 'GET' && path === '/api/notifications/vapid-public-key') {
    return send(response, 200, { publicKey: publicVapidKey });
  }

  if (method === 'POST' && path === '/api/auth/signup') {
    const name = requireText(body.name, 'Name');
    const email = requireText(body.email, 'Email', 254).toLowerCase();
    const password = requireText(body.password, 'Password', 200);
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return send(response, 400, { error: 'Enter a valid email and a password of at least 8 characters' });
    }
    if (await users.findOne({ email })) return send(response, 409, { error: 'An account with this email already exists' });
    const user = {
      _id: id(), name, email,
      ...(typeof body.avatar === 'string' ? { avatar: body.avatar } : {}),
      ...await hashPassword(password)
    };
    try {
      await users.insertOne(user);
    } catch (error) {
      if (error.code === 11000) return send(response, 409, { error: 'An account with this email already exists' });
      throw error;
    }
    await ensureProgress(user._id);
    const token = await createSession(user);
    return send(response, 201, { user: publicUser(user), token });
  }

  if (method === 'POST' && path === '/api/auth/login') {
    const email = requireText(body.email, 'Email', 254).toLowerCase();
    const password = requireText(body.password, 'Password', 200);
    const user = await users.findOne({ email });
    if (!user || !await verifyPassword(password, user)) return send(response, 401, { error: 'Email or password is incorrect' });
    const token = await createSession(user);
    return send(response, 200, { user: publicUser(user), token });
  }

  const user = await authenticate(request);
  if (!user) return send(response, 401, { error: 'Sign in to continue' });

  if (method === 'GET' && path === '/api/session') {
    const workspaceList = await workspaces.find({ 'members.userId': user._id }).toArray();
    return send(response, 200, { user: publicUser(user), workspaces: workspaceList.map((workspace) => publicWorkspace(workspace, user._id)) });
  }

  if (method === 'POST' && path === '/api/auth/logout') {
    const authorization = request.headers.authorization || '';
    const token = authorization.replace(/^Bearer\s+/i, '');
    await sessions.deleteOne({ tokenHash: tokenHash(token) });
    return send(response, 200, { ok: true });
  }

  if (method === 'GET' && path === '/api/workspaces') {
    const workspaceList = await workspaces.find({ 'members.userId': user._id }).toArray();
    return send(response, 200, { workspaces: workspaceList.map((workspace) => publicWorkspace(workspace, user._id)) });
  }

  const workspaceMembersMatch = path.match(/^\/api\/workspaces\/([a-f\d]+)\/members$/i);
  if (method === 'GET' && workspaceMembersMatch) {
    const workspace = await memberWorkspace(workspaceMembersMatch[1], user._id);
    const memberUsers = await users.find({ _id: { $in: workspace.members.map((member) => member.userId) } }).toArray();
    const usersById = new Map(memberUsers.map((member) => [member._id, member]));
    return send(response, 200, { members: workspace.members.flatMap((membership) => {
      const member = usersById.get(membership.userId);
      return member ? [{
        id: member._id,
        name: member.name,
        initials: member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        role: membership.role === 'admin' ? 'Admin' : 'Member',
        isMe: member._id === user._id,
        ...(member.avatar ? { avatar: member.avatar } : {})
      }] : [];
    }) });
  }

  if (method === 'POST' && path === '/api/workspaces/personal') {
    let workspace = await workspaces.findOne({ mode: 'personal', 'members.userId': user._id });
    if (!workspace) {
      workspace = { _id: id(), mode: 'personal', name: 'Personal', code: null, members: [{ userId: user._id, role: null }] };
      await workspaces.insertOne(workspace);
    }
    return send(response, 200, { workspace: publicWorkspace(workspace, user._id) });
  }

  if (method === 'POST' && path === '/api/workspaces') {
    const name = requireText(body.name, 'Workspace name');
    const workspace = {
      _id: id(), mode: 'team', name, code: await makeTeamCode(name),
      ...(typeof body.category === 'string' ? { category: body.category.slice(0, 100) } : {}),
      ...(typeof body.description === 'string' ? { description: body.description.slice(0, 500) } : {}),
      members: [{ userId: user._id, role: 'admin' }]
    };
    await workspaces.insertOne(workspace);
    return send(response, 201, { workspace: publicWorkspace(workspace, user._id) });
  }

  if (method === 'POST' && path === '/api/workspaces/join') {
    const code = requireText(body.code, 'Team code', 20).toUpperCase();
    const workspace = await workspaces.findOne({ mode: 'team', code });
    if (!workspace) return send(response, 404, { error: 'No team was found with that code' });
    if (workspace.members.some((member) => member.userId === user._id)) {
      return send(response, 200, { status: 'joined', workspace: publicWorkspace(workspace, user._id) });
    }
    const existingRequest = await joinRequests.findOne({ workspaceId: workspace._id, requesterUserId: user._id, status: 'pending' });
    if (existingRequest) return send(response, 202, { status: 'pending', workspaceName: workspace.name });
    await joinRequests.insertOne({
      _id: id(),
      workspaceId: workspace._id,
      workspaceName: workspace.name,
      teamCode: code,
      requesterUserId: user._id,
      requesterName: user.name,
      requesterEmail: user.email,
      status: 'pending',
      createdAt: new Date()
    });
    return send(response, 202, { status: 'pending', workspaceName: workspace.name });
  }

  if (method === 'GET' && path === '/api/workspaces/join-requests/mine') {
    const requests = await joinRequests.find({ requesterUserId: user._id, status: { $in: ['pending', 'approved', 'rejected'] } }).sort({ createdAt: -1 }).limit(20).toArray();
    const results = await Promise.all(requests.map(async (request) => {
      const workspace = await workspaces.findOne({ _id: request.workspaceId });
      return {
        id: request._id,
        status: request.status,
        workspaceName: request.workspaceName,
        teamCode: request.teamCode,
        ...(request.status === 'approved' && workspace ? { workspace: publicWorkspace(workspace, user._id) } : {})
      };
    }));
    return send(response, 200, { requests: results });
  }

  if (method === 'GET' && path === '/api/workspaces/join-requests') {
    const adminWorkspaces = await workspaces.find({ members: { $elemMatch: { userId: user._id, role: 'admin' } } }, { projection: { _id: 1 } }).toArray();
    const workspaceIds = adminWorkspaces.map((workspace) => workspace._id);
    const requests = await joinRequests.find({ workspaceId: { $in: workspaceIds }, status: 'pending' }).sort({ createdAt: 1 }).toArray();
    return send(response, 200, { requests: requests.map((request) => ({
      id: request._id,
      workspaceId: request.workspaceId,
      workspaceName: request.workspaceName,
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      createdAt: request.createdAt
    })) });
  }

  const joinRequestMatch = path.match(/^\/api\/workspaces\/join-requests\/([a-f\d]+)\/(approve|decline)$/i);
  if (joinRequestMatch && method === 'POST') {
    const [, requestId, action] = joinRequestMatch;
    const joinRequest = await joinRequests.findOne({ _id: requestId, status: 'pending' });
    if (!joinRequest) return send(response, 404, { error: 'Pending join request not found' });
    const workspace = await memberWorkspace(joinRequest.workspaceId, user._id);
    if (!workspace.members.some((member) => member.userId === user._id && member.role === 'admin')) {
      return send(response, 403, { error: 'Only a workspace admin can review join requests' });
    }
    const status = action === 'approve' ? 'approved' : 'rejected';
    const result = await joinRequests.updateOne(
      { _id: joinRequest._id, status: 'pending' },
      { $set: { status, reviewedBy: user._id, reviewedAt: new Date() } }
    );
    if (!result.modifiedCount) return send(response, 409, { error: 'This join request has already been reviewed' });
    if (action === 'approve') {
      await workspaces.updateOne(
        { _id: workspace._id, 'members.userId': { $ne: joinRequest.requesterUserId } },
        { $push: { members: { userId: joinRequest.requesterUserId, role: 'member' } } }
      );
      const updatedWorkspace = await workspaces.findOne({ _id: workspace._id });
      return send(response, 200, { status, workspace: publicWorkspace(updatedWorkspace, joinRequest.requesterUserId) });
    }
    return send(response, 200, { status });
  }

  if (method === 'GET' && path === '/api/progress') return send(response, 200, withoutMongoId(await ensureProgress(user._id)));

  if (method === 'POST' && path === '/api/progress/complete') {
    const priority = body.priority;
    if (!Object.hasOwn(priorityStars, priority)) return send(response, 400, { error: 'Priority must be high, medium, or low' });
    const earned = priorityStars[priority];
    await ensureProgress(user._id);
    await progressRecords.updateOne({ _id: user._id }, [{ $set: {
      stars: { $add: ['$stars', earned] },
      weekCount: { $add: ['$weekCount', 1] },
      completed: { $add: ['$completed', 1] },
      reliability: { $min: [100, { $add: ['$reliability', 1] }] }
    } }]);
    return send(response, 200, { ...withoutMongoId(await progressRecords.findOne({ _id: user._id })), earned });
  }

  if (path === '/api/settings' && method === 'GET') return send(response, 200, withoutMongoId(await settingsRecords.findOne({ _id: user._id })) ?? null);
  if (path === '/api/settings' && method === 'PUT') {
    const settings = { ...body };
    delete settings._id;
    await settingsRecords.replaceOne({ _id: user._id }, { _id: user._id, ...settings }, { upsert: true });
    return send(response, 200, settings);
  }

  if (path === '/api/reminders/notifications/claim' && method === 'POST') {
    const memberWorkspaces = await workspaces.find({ 'members.userId': user._id }, { projection: { _id: 1 } }).toArray();
    const workspaceIds = memberWorkspaces.map((workspace) => workspace._id);
    if (workspaceIds.length === 0) return send(response, 200, { reminders: [] });
    const dueReminders = await reminders.find({
      workspaceId: { $in: workspaceIds },
      creatorUserId: user._id,
      status: 'open',
      dueAt: { $lte: new Date() },
      notificationSentAt: { $exists: false }
    }).toArray();
    const claimed = [];
    for (const reminder of dueReminders) {
      const claimedAt = new Date();
      const result = await reminders.updateOne(
        { _id: reminder._id, notificationSentAt: { $exists: false }, status: 'open' },
        { $set: { notificationSentAt: claimedAt } }
      );
      if (result.modifiedCount) {
        await notificationHistory.updateOne(
          { reminderId: reminder._id },
          { $setOnInsert: {
            _id: id(),
            reminderId: reminder._id,
            recipientUserId: user._id,
            workspaceId: reminder.workspaceId,
            title: reminder.title,
            dueAt: reminder.dueAt,
            dueTime: reminder.dueTime,
            createdAt: claimedAt,
            readAt: null
          } },
          { upsert: true }
        );
        claimed.push({ ...withoutMongoId(reminder), id: reminder._id });
      }
    }
    return send(response, 200, { reminders: claimed });
  }

  if (path === '/api/notifications' && method === 'GET') {
    const records = await notificationHistory.find({ recipientUserId: user._id }).sort({ createdAt: -1 }).limit(50).toArray();
    return send(response, 200, { notifications: records.map((record) => ({ ...withoutMongoId(record), id: record._id })) });
  }

  const notificationMatch = path.match(/^\/api\/notifications\/([a-f\d]+)\/read$/i);
  if (notificationMatch && method === 'POST') {
    const notification = await notificationHistory.findOne({ _id: notificationMatch[1], recipientUserId: user._id });
    if (!notification) return send(response, 404, { error: 'Notification not found' });
    await notificationHistory.updateOne({ _id: notification._id }, { $set: { readAt: new Date() } });
    const updated = await notificationHistory.findOne({ _id: notification._id });
    return send(response, 200, { ...withoutMongoId(updated), id: updated._id });
  }

  // --- Push Notification subscription endpoint --------------------------------
  if (method === 'POST' && path === '/api/notifications/subscribe') {
    const { endpoint, keys } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return send(response, 400, { error: 'Invalid push subscription: endpoint and keys (p256dh, auth) are required' });
    }
    const subscription = { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
    // Upsert: add if not already stored for this user (keyed by endpoint)
    await users.updateOne(
      { _id: user._id, 'pushSubscriptions.endpoint': { $ne: endpoint } },
      { $push: { pushSubscriptions: subscription } }
    );
    return send(response, 200, { ok: true });
  }

  if (path === '/api/reminders' && method === 'GET') {
    const workspaceId = url.searchParams.get('workspaceId');
    if (!workspaceId) return send(response, 400, { error: 'workspaceId query parameter is required' });
    await memberWorkspace(workspaceId, user._id);
    const reminderList = await reminders.find({ workspaceId }).toArray();
    return send(response, 200, { reminders: reminderList.map((reminder) => ({
      ...withoutMongoId(reminder),
      id: reminder._id,
      assignee: { ...reminder.assignee, isMe: reminder.assignee?.id === user._id }
    })) });
  }

  if (path === '/api/reminders' && method === 'POST') {
    const workspaceId = requireText(body.workspaceId, 'Workspace ID');
    const workspace = await memberWorkspace(workspaceId, user._id);
    const title = requireText(body.title, 'Reminder title');
    const assigneeId = typeof body.assignee?.id === 'string' ? body.assignee.id : user._id;
    const requesterMembership = workspace.members.find((member) => member.userId === user._id);
    if (assigneeId !== user._id && requesterMembership?.role !== 'admin') {
      return send(response, 403, { error: 'Only a team admin can assign reminders to another member' });
    }
    const assigneeMembership = workspace.members.find((member) => member.userId === assigneeId);
    if (!assigneeMembership) return send(response, 400, { error: 'Choose a current workspace member as the assignee' });
    const assigneeUser = await users.findOne({ _id: assigneeId });
    if (!assigneeUser) return send(response, 400, { error: 'The selected assignee no longer exists' });
    if (!Object.hasOwn(priorityStars, body.priority)) return send(response, 400, { error: 'Priority must be high, medium, or low' });
    const dueDate = requireText(body.dueDate, 'Reminder date', 10);
    const dueTime = requireText(body.dueTime, 'Reminder time', 5);
    const dueAt = new Date(requireText(body.dueAt, 'Reminder due timestamp', 40));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !/^\d{2}:\d{2}$/.test(dueTime) || Number.isNaN(dueAt.getTime())) {
      return send(response, 400, { error: 'Enter a valid reminder date and time' });
    }
    const reminder = {
      ...body, _id: id(), workspaceId, creatorUserId: user._id, space: body.space === 'personal' ? 'personal' : workspace.mode, title,
      dueDate, dueTime, dueAt, status: 'open', comments: Array.isArray(body.comments) ? body.comments : [], pokes: 0,
      assignee: {
        id: assigneeUser._id,
        name: assigneeUser.name,
        initials: assigneeUser.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        role: assigneeMembership.role === 'admin' ? 'Admin' : 'Member',
        ...(assigneeUser.avatar ? { avatar: assigneeUser.avatar } : {})
      }
    };
    delete reminder.id;
    await reminders.insertOne(reminder);
    return send(response, 201, {
      ...withoutMongoId(reminder),
      id: reminder._id,
      assignee: { ...reminder.assignee, isMe: reminder.assignee.id === user._id }
    });
  }

  const reminderMatch = path.match(/^\/api\/reminders\/([^/]+)$/i);
  if (reminderMatch && method === 'PATCH') {
    let reminder = await reminders.findOne({ _id: reminderMatch[1] });
    if (!reminder && reminderMatch[1].length === 24) {
      try {
        const { ObjectId } = require('mongodb');
        reminder = await reminders.findOne({ _id: new ObjectId(reminderMatch[1]) });
      } catch (e) {
        // Ignore invalid ObjectId error
      }
    }
    if (!reminder) return send(response, 404, { error: 'Reminder not found' });
    await memberWorkspace(reminder.workspaceId, user._id);
    if (body.status !== undefined && !['open', 'done'].includes(body.status)) return send(response, 400, { error: 'Status must be open or done' });
    const allowedFields = ['title', 'priority', 'due', 'dueDate', 'dueTime', 'comments', 'pokes', 'pokedByMe', 'pokedBy', 'status', 'aiNote', 'source', 'assignee'];
    const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));
    if (updates.assignee !== undefined) {
      const workspace = await memberWorkspace(reminder.workspaceId, user._id);
      const requesterMembership = workspace.members.find((member) => member.userId === user._id);
      if (requesterMembership?.role !== 'admin') return send(response, 403, { error: 'Only a team admin can reassign reminders' });
      const assigneeId = typeof updates.assignee?.id === 'string' ? updates.assignee.id : '';
      const assigneeMembership = workspace.members.find((member) => member.userId === assigneeId);
      if (!assigneeMembership) return send(response, 400, { error: 'Choose a current workspace member as the assignee' });
      const assigneeUser = await users.findOne({ _id: assigneeId });
      if (!assigneeUser) return send(response, 400, { error: 'The selected assignee no longer exists' });
      updates.assignee = {
        id: assigneeUser._id,
        name: assigneeUser.name,
        initials: assigneeUser.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        role: assigneeMembership.role === 'admin' ? 'Admin' : 'Member',
        ...(assigneeUser.avatar ? { avatar: assigneeUser.avatar } : {})
      };
    }
    if (updates.priority !== undefined && !Object.hasOwn(priorityStars, updates.priority)) return send(response, 400, { error: 'Priority must be high, medium, or low' });
    await reminders.updateOne({ _id: reminder._id }, { $set: updates });
    const updated = await reminders.findOne({ _id: reminder._id });
    return send(response, 200, {
      ...withoutMongoId(updated),
      id: updated._id,
      assignee: { ...updated.assignee, isMe: updated.assignee?.id === user._id }
    });
  }

  if (reminderMatch && method === 'DELETE') {
    let reminder = await reminders.findOne({ _id: reminderMatch[1] });
    if (!reminder && reminderMatch[1].length === 24) {
      try {
        const { ObjectId } = require('mongodb');
        reminder = await reminders.findOne({ _id: new ObjectId(reminderMatch[1]) });
      } catch (e) {
        // Ignore invalid ObjectId error
      }
    }
    if (!reminder) return send(response, 404, { error: 'Reminder not found' });
    
    const workspace = await memberWorkspace(reminder.workspaceId, user._id);
    const requesterMembership = workspace.members.find((member) => member.userId === user._id);
    
    if (reminder.creatorUserId !== user._id && requesterMembership?.role !== 'admin') {
      return send(response, 403, { error: 'You do not have permission to delete this reminder' });
    }

    await reminders.deleteOne({ _id: reminder._id });
    
    return send(response, 200, { ok: true });
  }

  console.log(`[DEBUG] 404 Route not found -> Method: ${method}, Path: ${path}, Matches: ${!!reminderMatch}`);
  return send(response, 404, { error: 'Route not found' });
}

const server = createServer((request, response) => {
  const origin = request.headers.origin;
  if (origin && frontendOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    response.setHeader('Vary', 'Origin');
  }
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }
  handle(request, response).catch((error) => {
    console.error(error);
    if (!response.headersSent) send(response, error.status || 500, { error: error.status ? error.message : 'Internal server error' });
    else response.destroy();
  });
});

server.listen(port, () => {
  console.log(`Diva API listening on http://localhost:${port}`);

  // Start the push notification cron job
  startNotificationCron({ reminders, users });
});