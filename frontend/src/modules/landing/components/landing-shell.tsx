import { PropsWithChildren } from 'react';

export function LandingShell({ children }: PropsWithChildren) {
  return <div className="mx-auto w-full max-w-7xl px-4 md:px-6 xl:px-8">{children}</div>;
}