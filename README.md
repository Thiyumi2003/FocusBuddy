# FocusBuddy

This repository is a small monorepo with separately deployable projects:

- Frontend: Vite/React at the repository root (`src/`, root `package.json`)
- Backend: Node/MongoDB in `backend/` (`backend/server.js`, `backend/package.json`)

## Getting Started

Install both dependency sets, then start the API and frontend in separate terminals:

```sh
npm install
cd backend
npm install
cd ..
npm run dev:backend
npm run dev
```

For local development, copy `.env.example` to `.env` in the repository root and configure `MONGODB_URI`. `npm run dev:backend` reads that root file. To run the backend package directly from `backend/`, copy `backend/.env.example` to `backend/.env` instead. Set `MONGODB_DB` to choose a database (defaults to `diva`) and `API_PORT` to change the backend port. Keep `.env` private and out of source control. URI-encode special characters in the database username or password.

The Vite development server proxies `/api` requests to `http://localhost:3001`. In a deployed frontend, set `VITE_API_URL` to the public HTTPS origin of the deployed backend.

## Render and Vercel

Both services use the same repository but have separate root directories. Create the Vercel project first so you know its production origin, then configure Render CORS, and finally set the Vercel API URL.

1. In Vercel, import this repository. Keep **Root Directory** at the repository root, use the Vite framework preset, build command `npm run build`, and output directory `dist`. Deploy once to get the production domain; API calls will work after the remaining steps.
2. In Render, create a **Web Service** for this repository. Set **Root Directory** to `backend`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
3. Add Render environment variables: `MONGODB_URI` (your rotated Atlas URI), `MONGODB_DB` (`diva`), and `FRONTEND_ORIGIN` (the exact Vercel origin if it differs from `https://focus-buddy-one.vercel.app`). Render provides `PORT`; the backend now uses it automatically. Do not set `API_PORT` on Render.
4. Deploy the Render service and confirm `https://<your-render-service>.onrender.com/api/health` returns `{"status":"ok","database":"connected"}`.
5. In Vercel project environment variables, set `VITE_API_URL` to the Render service's public HTTPS URL, with no trailing slash. Apply it to Production (and Preview too if you use preview deployments), then redeploy.
6. If the Vercel URL changes, update Render's `FRONTEND_ORIGIN` to match exactly and redeploy the Render service. For multiple allowed frontend origins, separate them with commas.

In MongoDB Atlas, allow network access from Render's outbound addresses. If your Render plan does not provide stable outbound addresses, Atlas may require a broader IP rule; use the narrowest rule your hosting plan supports and a dedicated, rotated database user password.

In the app, choose **Enable alerts** in the reminder view and allow browser notifications. Due reminders are checked every 15 seconds while the app is open. This local polling does not send alerts while the browser is closed; background delivery requires a push service and service worker.

## Backend API

The standalone server is [backend/server.js](backend/server.js). It stores users, sessions, workspaces, reminders, settings, and progress in MongoDB collections and creates indexes on startup. Passwords are hashed with scrypt; API routes other than health, signup, and login require an `Authorization: Bearer <token>` header. Signup and login return the token.

- `GET /api/health`
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET /api/session`
- `GET /api/workspaces`, `POST /api/workspaces`, `POST /api/workspaces/join`, `POST /api/workspaces/personal`
- `GET /api/workspaces/join-requests`, `GET /api/workspaces/join-requests/mine`
- `POST /api/workspaces/join-requests/:id/approve`, `POST /api/workspaces/join-requests/:id/decline`
- `GET /api/workspaces/join-requests`, `GET /api/workspaces/join-requests/mine`
- `POST /api/workspaces/join-requests/:id/approve`, `POST /api/workspaces/join-requests/:id/decline`
- `GET /api/progress`, `POST /api/progress/complete`
- `GET /api/settings`, `PUT /api/settings`
- `GET /api/reminders?workspaceId=...`, `POST /api/reminders`, `PATCH /api/reminders/:id`
- `POST /api/reminders/notifications/claim`, `GET /api/notifications`, `POST /api/notifications/:id/read`

This is a lightweight backend for development and prototyping. For production, add operational controls such as rate limiting, account recovery delivery, and deployment-specific security configuration. Rotate any database credential that has been shared in chat before using it.
