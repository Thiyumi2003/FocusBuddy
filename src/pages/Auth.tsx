import React, { useState } from 'react';
import { AuthBrandPanel } from '../components/auth/AuthBrandPanel';
import { LogInForm } from '../components/auth/LogInForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { SocialButtons } from '../components/auth/SocialButtons';
import { BrandMark } from '../components/BrandMark';
import { Mascot } from '../components/Mascot';
import { InstallAppButton } from '../components/InstallAppButton';
import { useSession } from '../contexts/SessionContext';

type Tab = 'signup' | 'login';

export function Auth() {
  const { signIn } = useSession();
  const [tab, setTab] = useState<Tab>('signup');

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <AuthBrandPanel />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <div>
              <BrandMark />
              <p className="mt-3 text-sm font-semibold text-muted">We don’t remind you more. We remind you better.</p>
            </div>
            <Mascot mood="wave" size={80} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {tab === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {tab === 'signup' ? 'It takes less than a minute. The AI learns the rest as you go.' : 'Log in to see what needs you today.'}
          </p>
          <div className="mt-4">
            <InstallAppButton />
          </div>

          <div role="tablist" aria-label="Authentication" className="mt-6 grid grid-cols-2 rounded-full bg-lavender-soft p-1">
            {[
            { id: 'signup' as Tab, label: 'Sign Up' },
            { id: 'login' as Tab, label: 'Log In' }].
            map((t) =>
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full py-2.5 text-sm font-bold transition-[background-color,color,box-shadow] duration-200 ${
              tab === t.id ? 'bg-white font-extrabold text-accent-ink shadow-card' : 'text-lavender-ink hover:text-ink'}`
              }>
              
                {t.label}
              </button>
            )}
          </div>

          <div className="mt-6">
            {tab === 'signup' ? <SignUpForm onSuccess={signIn} /> : <LogInForm onSuccess={signIn} />}
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-muted">or continue with</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <SocialButtons />

          <p className="mt-8 text-center text-[13px] text-muted">
            {tab === 'signup' ? 'Already have an account? ' : 'New to FocusBuddy? '}
            <button onClick={() => setTab(tab === 'signup' ? 'login' : 'signup')} className="font-medium text-accent hover:text-accent-ink">
              {tab === 'signup' ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </div>
      </main>
    </div>);

}