import React from 'react';
import { Toaster } from 'sonner';
import { AppShell } from './components/AppShell';
import { ProgressProvider } from './contexts/ProgressContext';
import { SessionProvider } from './contexts/SessionContext';

export function App() {
  return (
    <SessionProvider>
      <ProgressProvider>
        <AppShell />
      </ProgressProvider>
      <Toaster position="bottom-left" toastOptions={{ className: 'font-sans' }} />
    </SessionProvider>);

}