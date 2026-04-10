import { ReactNode } from 'react';

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs uppercase tracking-[0.24em] theme-field-label">
      {children}
    </label>
  );
}

export function FieldHint({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-2 text-xs theme-field-hint">{children}</p>;
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-2 text-xs theme-field-error">{children}</p>;
}
