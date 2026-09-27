import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, CheckIcon, LoaderCircleIcon, MailCheckIcon } from 'lucide-react';
import { SessionUser } from '../../types/session';
import { logIn } from '../../utils/api';
import { EMAIL_PATTERN } from '../../utils/validation';
import { AuthInput } from './AuthInput';
import { PasswordToggle } from './PasswordToggle';

type Mode = 'login' | 'forgot' | 'sent';

export function LogInForm({ onSuccess }: {onSuccess: (user: SessionUser) => void;}) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string;password?: string;}>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: {email?: string;password?: string;} = {};
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter the email you signed up with';
    if (mode === 'login' && !password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;
    setServerError('');
    setLoading(true);
    if (mode === 'forgot') {
      timer.current = window.setTimeout(() => {
        setLoading(false);
        setMode('sent');
      }, 800);
      return;
    }
    try {
      const result = await logIn({ email: email.trim(), password });
      onSuccess(result.user);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not log in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'sent') {
    return (
      <div className="rounded-2xl bg-lavender-soft p-6 text-center">
        <MailCheckIcon className="mx-auto h-8 w-8 text-lavender-ink" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-ink">Check your inbox</p>
        <p className="mt-1 text-[13px] text-muted">We sent a reset link to {email}. It expires in 30 minutes.</p>
        <button onClick={() => setMode('login')} className="mt-4 text-[13px] font-medium text-accent hover:text-accent-ink">
          Back to log in
        </button>
      </div>);

  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serverError && <p role="alert" className="rounded-lg bg-pink-soft px-3 py-2 text-[13px] text-pink-ink">{serverError}</p>}
      {mode === 'forgot' &&
      <div>
          <button type="button" onClick={() => setMode('login')} className="flex items-center gap-1 text-[13px] text-muted hover:text-ink">
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
            Back
          </button>
          <p className="mt-2 text-[13px] text-muted">Enter your email and we’ll send you a link to reset your password.</p>
        </div>
      }
      <AuthInput
        id="li-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@university.lk"
        value={email}
        error={errors.email}
        onChange={(e) => {
          setEmail(e.target.value);
          setServerError('');
          setErrors((er) => ({ ...er, email: undefined }));
        }} />
      
      {mode === 'login' &&
      <>
          <AuthInput
          id="li-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            setServerError('');
            setErrors((er) => ({ ...er, password: undefined }));
          }}
          trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((s) => !s)} />} />
        
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
              <input type="checkbox" className="peer sr-only" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span
              aria-hidden
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
              remember ? 'border-accent bg-accent text-white' : 'border-line bg-surface'}`
              }>
              
                {remember && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
              </span>
              Remember me
            </label>
            <button type="button" onClick={() => setMode('forgot')} className="text-[13px] font-medium text-accent hover:text-accent-ink">
              Forgot Password?
            </button>
          </div>
        </>
      }
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-ink disabled:opacity-70">
        
        {loading && <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />}
        {mode === 'forgot' ? loading ? 'Sending…' : 'Send reset link' : loading ? 'Logging in…' : 'Log In'}
      </button>
    </form>);

}