import React from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, GraduationCapIcon, LeafIcon, MinusIcon, SparklesIcon, BoxIcon } from "lucide-react";
import { Mascot } from "../components/Mascot";
import { useSession } from "../contexts/SessionContext";
import { comparisonRows, personalPlans, teamRatePerMember } from "../data/plans";
const planIcons: Record<string, BoxIcon> = {
  free: LeafIcon,
  premium: SparklesIcon,
  student: GraduationCapIcon
};
export function Subscription() {
  const {
    workspace,
    leaveWorkspace
  } = useSession();
  const isTeam = workspace?.mode === 'team';
  const members = workspace?.members ?? 0;
  function choose(id: string) {
    toast(`${id === 'student' ? 'Student plan verification' : 'Plan changes'} are not connected yet.`);
  }
  return <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-ink sm:text-[30px]">Subscription & Workspace</h1>
        <p className="mt-1 text-sm font-semibold text-muted">Free is a reminder app. Premium is an AI companion. Team makes it collaborative.</p>
      </header>

      {isTeam ? <section aria-labelledby="workspace-title" className="flex flex-col gap-5 rounded-3xl bg-surface p-6 shadow-card ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
          <div className="min-w-0 flex-1">
            <h2 id="workspace-title" className="text-xl font-black text-ink">{workspace?.name}</h2>
            <p className="mt-1 text-sm font-semibold text-muted">Team code <span className="font-mono">{workspace?.code}</span> · {members} {members === 1 ? 'member' : 'members'}</p>
          </div>
          <button onClick={() => {
            navigator.clipboard?.writeText(workspace?.code ?? '');
            toast('Team code copied');
          }} className="flex items-center justify-center gap-1.5 rounded-lg bg-lavender-soft px-4 py-2 text-[13px] font-extrabold text-lavender-ink">
            <CopyIcon className="h-3.5 w-3.5" aria-hidden />
            Copy invite code
          </button>
        </section> : <section className="flex flex-col gap-4 rounded-3xl bg-mint-soft p-6 ring-1 ring-white sm:flex-row sm:items-center sm:p-8">
          <Mascot mood="wave" size={80} className="shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-black text-ink">You’re in Personal Mode</h2>
            <p className="mt-1 text-sm font-semibold text-mint-ink">Create a Team Space to share reminders and collaborate with teammates.</p>
          </div>
          <button onClick={leaveWorkspace} className="shrink-0 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-white shadow-pop transition-transform duration-150 active:scale-95">
            Create or join a team
          </button>
        </section>}

      <section aria-labelledby="plans-title" className="mt-10">
        <h2 id="plans-title" className="mb-4 text-lg font-black text-ink">Personal plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {personalPlans.map((plan) => {
          const Icon = planIcons[plan.id];
          const popular = plan.id === 'premium';
              return <article key={plan.id} className={`relative flex flex-col rounded-3xl bg-surface p-6 shadow-card ${popular ? 'ring-2 ring-accent' : 'ring-1 ring-white'}`}>
                {popular && <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold text-white shadow-card">Most loved</span>}
                <div className="flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${plan.tone}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-black text-ink">{plan.name}</h3>
                <p className="text-[13px] font-semibold text-muted">{plan.tagline}</p>
                <p className="mt-4">
                  <span className="text-4xl font-black tracking-tight text-ink">{plan.price}</span>
                  <span className="ml-1 text-[13px] font-semibold text-muted">{plan.unit}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.highlights.map((h) => <li key={h} className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                      <CheckIcon className="h-4 w-4 shrink-0 text-mint-ink" strokeWidth={3} aria-hidden />
                      {h}
                    </li>)}
                </ul>
                <div className="mt-auto pt-6">
                  <button onClick={() => choose(plan.id)} className={`w-full whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-extrabold transition-[background-color,transform] duration-150 active:scale-[0.98] ${popular ? 'bg-accent text-white shadow-pop hover:bg-accent-ink' : 'bg-white text-ink ring-1 ring-line hover:bg-lavender-soft'}`}>
                    {plan.id === 'student' ? 'Student plan details' : 'Select plan'}
                  </button>
                </div>
              </article>;
        })}
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl bg-surface shadow-card ring-1 ring-white">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <caption className="sr-only">Feature comparison</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-5 py-4 font-black text-ink">Feature checklist</th>
                <th scope="col" className="px-3 py-4 text-center font-extrabold text-mint-ink">Free</th>
                <th scope="col" className="bg-accent-soft px-3 py-4 text-center font-extrabold text-accent-ink">Premium</th>
                <th scope="col" className="px-3 py-4 text-center font-extrabold text-pink-ink">Student</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => <tr key={row.feature} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-3 font-semibold text-ink">{row.feature}</th>
                  {[row.free, row.premium, row.student].map((v, i) => <td key={i} className={`px-3 py-3 text-center ${i === 1 ? 'bg-accent-soft/60' : ''}`}>
                      {typeof v === 'string' ? <span className="text-xs font-extrabold text-muted">{v}</span> : v ? <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mint-soft text-mint-ink">
                          <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} aria-label="Included" />
                        </span> : <MinusIcon className="mx-auto h-4 w-4 text-subtle" aria-label="Not included" />}
                    </td>)}
                </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {isTeam ? <section aria-labelledby="calc-title" className="rounded-3xl bg-surface p-6 shadow-card ring-1 ring-white">
            <h2 id="calc-title" className="text-base font-black text-ink">Team pricing</h2>
            <p className="mt-1 text-sm font-semibold text-muted">Only pay for active members.</p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-muted">Active members</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="w-8 text-center text-xl font-black text-ink" aria-live="polite">{members}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted">{members} × ${teamRatePerMember}</p>
                <p className="text-4xl font-black tracking-tight text-ink">${members * teamRatePerMember}</p>
                <p className="text-xs font-semibold text-muted">per month</p>
              </div>
            </div>
            <p className="mt-6 rounded-2xl bg-lavender-soft p-4 text-[13px] font-semibold text-lavender-ink">
              Each member keeps private AI settings and progress. Admins only manage team defaults.
            </p>
            <p className="mt-4 text-[13px] font-semibold text-muted">
              Bigger organisation or university?{' '}
              <button onClick={() => toast('Thanks! We’ll reach out within a day 💌')} className="font-extrabold text-accent hover:text-accent-ink">
                Talk to us about Enterprise
              </button>
            </p>
          </section> : <section className="flex flex-col items-center justify-center rounded-3xl bg-surface p-6 text-center shadow-card ring-1 ring-white">
            <Mascot mood="happy" size={80} />
            <h2 className="mt-3 text-base font-black text-ink">Why go Premium?</h2>
            <p className="mt-1 max-w-xs text-sm font-semibold text-muted">You pay for better timing and gentler nudges, not for more reminders.</p>
          </section>}
      </div>
    </div>;
}