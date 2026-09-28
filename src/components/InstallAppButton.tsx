import React, { useEffect, useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallAppButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [isAppleMobile, setIsAppleMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setIsAppleMobile(/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (isInstalled || (!prompt && !isAppleMobile)) return null;

  async function install() {
    if (!prompt) {
      toast('Install FocusBuddy', { description: 'Tap Share, then choose Add to Home Screen.' });
      return;
    }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') setPrompt(null);
  }

  return (
    <button
      type="button"
      onClick={() => void install()}
      className="flex w-full items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-left text-[13px] font-bold text-ink transition-colors hover:bg-canvas"
    >
      <DownloadIcon className="h-4 w-4 text-accent" aria-hidden />
      Install app
    </button>
  );
}