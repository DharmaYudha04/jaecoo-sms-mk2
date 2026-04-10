import { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] theme-muted">{eyebrow}</p>
        <h1 className="section-title mt-3">{title}</h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
