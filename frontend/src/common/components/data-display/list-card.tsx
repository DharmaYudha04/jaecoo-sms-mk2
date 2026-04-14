import { ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

type ListCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function ListCard({ title, subtitle, meta, footer, className }: ListCardProps) {
  return (
    <div className={cn('rounded-[22px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold theme-text">{title}</p>
          {subtitle ? <div className="mt-1 text-sm theme-muted">{subtitle}</div> : null}
        </div>
        {meta ? <div>{meta}</div> : null}
      </div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
