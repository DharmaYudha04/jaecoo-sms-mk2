import { PropsWithChildren } from 'react';
import { cn } from '@/common/utils/cn';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        'glass rounded-[28px] p-5 theme-text transition duration-300 ease-out hover:-translate-y-1 hover:border-[color:var(--line-strong)] hover:shadow-[0_22px_50px_rgba(0,0,0,0.18)] motion-reduce:transform-none',
        className,
      )}
    >
      {children}
    </section>
  );
}
