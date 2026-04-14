import { Card } from '@/common/components/ui/card';

type StatCardProps = {
  label: string;
  value: string | number;
  note: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm theme-muted">{label}</p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
      <p className="mt-4 text-sm theme-muted">{note}</p>
    </Card>
  );
}
