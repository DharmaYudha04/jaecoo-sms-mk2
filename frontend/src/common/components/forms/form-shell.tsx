import { ReactNode } from 'react';
import { Card } from '@/common/components/ui/card';

export function FormShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.28em] theme-muted">{eyebrow}</p>
      <h2 className="mt-4 text-2xl font-semibold theme-text">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm theme-muted">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </Card>
  );
}
