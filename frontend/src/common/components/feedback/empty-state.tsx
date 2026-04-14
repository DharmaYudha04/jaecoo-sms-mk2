export function EmptyState({ message }: { message: string }) {
  return <div className="rounded-[24px] border border-dashed border-[color:var(--line)] bg-[color:var(--panel-light)] p-6 text-sm theme-muted">{message}</div>;
}