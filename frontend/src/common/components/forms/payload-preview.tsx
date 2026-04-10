import { Card } from '@/common/components/ui/card';

export function PayloadPreview({ title = 'Payload', payload }: { title?: string; payload?: unknown }) {
  if (!payload) return null;

  return (
    <Card className="overflow-hidden">
      <p className="text-xs uppercase tracking-[0.28em] theme-muted">{title}</p>
      <pre className="mt-4 overflow-auto rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-4 text-xs leading-6 theme-text">{JSON.stringify(payload, null, 2)}</pre>
    </Card>
  );
}
