import React, { useEffect, useState } from 'react';
import { CheckIcon, Clock3Icon, UserRoundIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getTeamJoinRequests, reviewTeamJoinRequest, TeamJoinRequest } from '../utils/api';

export function TeamJoinRequests() {
  const [requests, setRequests] = useState<TeamJoinRequest[]>([]);
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const next = await getTeamJoinRequests();
        if (active) setRequests(next);
      } catch {
        // Retry quietly during the next poll.
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  async function review(request: TeamJoinRequest, action: 'approve' | 'decline') {
    setReviewing(request.id);
    try {
      await reviewTeamJoinRequest(request.id, action);
      setRequests((current) => current.filter((item) => item.id !== request.id));
      toast.success(action === 'approve' ? `${request.requesterName} joined ${request.workspaceName}.` : `Request declined for ${request.requesterName}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not review this request.');
    } finally {
      setReviewing(null);
    }
  }

  if (requests.length === 0) return null;

  return (
    <section aria-labelledby="team-requests-title" className="mx-auto mt-4 w-full max-w-[1240px] px-4 sm:px-6 lg:px-10">
      <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <UserRoundIcon className="h-4 w-4 text-accent" aria-hidden />
          <h2 id="team-requests-title" className="text-sm font-semibold text-ink">Team join requests</h2>
          <span className="rounded-full bg-pink-soft px-2 py-0.5 text-xs font-bold text-pink-ink">{requests.length}</span>
        </div>
        <ul className="divide-y divide-line">
          {requests.map((request) => (
            <li key={request.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{request.requesterName} wants to join {request.workspaceName}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <span>{request.requesterEmail}</span>
                  <span aria-hidden>·</span>
                  <Clock3Icon className="h-3 w-3" aria-hidden />
                  <span>{new Date(request.createdAt).toLocaleString()}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={reviewing === request.id}
                  onClick={() => void review(request, 'decline')}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-canvas disabled:opacity-50"
                  aria-label={`Decline ${request.requesterName}`}
                  title="Decline"
                >
                  <XIcon className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={reviewing === request.id}
                  onClick={() => void review(request, 'approve')}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[13px] font-semibold text-white hover:bg-accent-ink disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" aria-hidden />
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
