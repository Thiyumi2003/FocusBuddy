import React from 'react';
import { useSession } from '../contexts/SessionContext';
import { Auth } from '../pages/Auth';
import { Dashboard } from '../pages/Dashboard';
import { WorkspaceSelect } from '../pages/WorkspaceSelect';

export function AppShell() {
  const { user, workspace } = useSession();
  if (!user) return <Auth />;
  if (!workspace) return <WorkspaceSelect />;
  return <Dashboard key={`${workspace.mode}-${workspace.name}`} />;
}