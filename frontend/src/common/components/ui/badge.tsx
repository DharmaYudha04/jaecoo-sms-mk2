import { PropsWithChildren } from 'react';
import { cn } from '@/common/utils/cn';

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full border border-[color:var(--line)] bg-[color:var(--panel-light)] px-3 py-1 text-xs font-semibold leading-4 theme-text whitespace-normal break-words',
        className,
      )}
    >
      {children}
    </span>
  );
}