import { InputHTMLAttributes } from 'react';
import { cn } from '@/common/utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border px-4 py-3 text-sm outline-none transition duration-200 placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:bg-[color:var(--panel-light)]',
        'border-[color:var(--line)] bg-[color:var(--panel-light)] text-[color:var(--text)]',
        className,
      )}
      {...props}
    />
  );
}
