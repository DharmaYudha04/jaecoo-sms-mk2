import { ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

type InfoPanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function InfoPanel({ title, children, className }: InfoPanelProps) {
  return (
    <div className={cn('rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-5', className)}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.24em] theme-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
