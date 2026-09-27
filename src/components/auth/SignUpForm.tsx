import React, { useState } from 'react';
import { LoaderCircleIcon } from 'lucide-react';
import { SessionUser } from '../../types/session';
import { EMAIL_PATTERN } from '../../utils/validation';
import { signUp } from '../../utils/api';
import { AuthInput } from './AuthInput';
import { AvatarPicker } from './AvatarPicker';
import { PasswordToggle } from './PasswordToggle';

type Values = {name: string;email: string;password: string;confirm: string;};
type Errors = Partial<Record<keyof Values, string>>;

export function SignUpForm({ onSuccess }: {onSuccess: (user: SessionUser) => void;}) {
  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirm: '' });
  const [avatar, setAvatar] = useState('bunny');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  function change(key: keyof Values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setServerError('');
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!values.name.trim()) next.name = 'Please enter your full name';
    if (!EMAIL_PATTERN.test(values.email.trim())) next.email = 'Enter a valid university or work email';
    if (values.password.length < 8) next.password = 'Use at least 8 characters';
    if (values.confirm !== values.password || !values.confirm) next.confirm = 'Passwords don’t match';
    setErrors(next);
    if (Object.keys(next).length) return;
    setServerError('');
    setLoading(true);
    try {
      const result = await signUp({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        avatar
      });
      onSuccess(result.user);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serverError && <p role="alert" className="rounded-lg bg-pink-soft px-3 py-2 text-[13px] text-pink-ink">{serverError}</p>}
      <AvatarPicker value={avatar} onChange={setAvatar} />
      <AuthInput id="su-name" label="Full name" autoComplete="name" placeholder="Your name" value={values.name} error={errors.name} onChange={(e) => change('name', e.target.value)} />
      <AuthInput id="su-email" label="University or work email" type="email" autoComplete="email" placeholder="you@university.lk" value={values.email} error={errors.email} onChange={(e) => change('email', e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput
          id="su-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          hint="8+ characters"
          value={values.password}
          error={errors.password}
          onChange={(e) => change('password', e.target.value)}
          trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((s) => !s)} />} />
        
        <AuthInput
          id="su-confirm"
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirm}
          error={errors.confirm}
          onChange={(e) => change('confirm', e.target.value)} />
        
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-extrabold text-white shadow-pop transition-[background-color,transform] duration-150 hover:bg-accent-ink active:scale-[0.98] disabled:opacity-70">
        
        {loading && <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />}
        {loading ? 'Creating your account…' : 'Create Account'}
      </button>
    </form>);

}