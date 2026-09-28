import React, { useState } from 'react';
import { MobileNav } from '../components/MobileNav';
import { ReminderNotifications } from '../components/ReminderNotifications';
import { TeamJoinRequests } from '../components/TeamJoinRequests';
import { Sidebar } from '../components/Sidebar';
import { SloganBanner } from '../components/SloganBanner';
import { useSession } from '../contexts/SessionContext';
import { TabId } from '../types/navigation';
import { Space } from '../types/reminders';
import { AISettings } from './AISettings';
import { Progress } from './Progress';
import { Subscription } from './Subscription';
import { TeamSpace } from './TeamSpace';

export function Dashboard() {
  const { workspace } = useSession();
  const [tab, setTab] = useState<TabId>('team');
  const [space, setSpace] = useState<Space>(workspace?.mode === 'personal' ? 'personal' : 'team');

  function changeTab(next: TabId) {
    setTab(next);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex min-h-screen w-full bg-canvas font-sans text-ink">
      <Sidebar active={tab} onChange={changeTab} space={space} onSpaceChange={setSpace} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav active={tab} onChange={changeTab} space={space} onSpaceChange={setSpace} />
        <SloganBanner />
        <ReminderNotifications />
        <TeamJoinRequests />
        <main className="flex-1">
          <div hidden={tab !== 'team'}>
            <TeamSpace space={space} onOpenProgress={() => changeTab('progress')} />
          </div>
          {tab === 'ai' && <AISettings />}
          {tab === 'progress' && <Progress />}
          {tab === 'subscription' && <Subscription />}
        </main>
      </div>
    </div>);

}