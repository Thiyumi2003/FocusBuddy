import React from 'react';

interface SettingsSectionProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-line py-8 first:border-t-0 first:pt-0">
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
        <div>
          <h2 id={`${id}-title`} className="text-[15px] font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>
        </div>
        <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </section>);

}