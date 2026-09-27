import React, { createContext, useContext, useMemo, useState } from 'react';
import { SessionUser, Workspace } from '../types/session';
import { clearSession, getStoredUser, getStoredWorkspace, storeSessionUser, storeWorkspace } from '../utils/api';

interface SessionValue {
  user: SessionUser | null;
  workspace: Workspace | null;
  signIn: (user: SessionUser) => void;
  enterWorkspace: (workspace: Workspace) => void;
  leaveWorkspace: () => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredUser());
  const [workspace, setWorkspace] = useState<Workspace | null>(() => getStoredWorkspace());

  const value = useMemo<SessionValue>(
    () => ({
      user,
      workspace,
      signIn: (nextUser) => {
        if (user?.id !== nextUser.id) {
          setWorkspace(null);
          storeWorkspace(null);
        }
        storeSessionUser(nextUser);
        setUser(nextUser);
      },
      enterWorkspace: (nextWorkspace) => {
        storeWorkspace(nextWorkspace);
        setWorkspace(nextWorkspace);
      },
      leaveWorkspace: () => {
        storeWorkspace(null);
        setWorkspace(null);
      },
      signOut: () => {
        setWorkspace(null);
        setUser(null);
        clearSession();
      }
    }),
    [user, workspace]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}