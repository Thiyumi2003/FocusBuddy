import React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export function PasswordToggle({ visible, onToggle }: {visible: boolean;onToggle: () => void;}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
      className="rounded-lg p-2 text-subtle transition-colors duration-150 hover:bg-canvas hover:text-ink">
      
      {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
    </button>);

}