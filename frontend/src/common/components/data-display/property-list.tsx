import { ReactNode } from 'react';

type PropertyItem = {
  label: string;
  value: ReactNode;
};

export function PropertyList({ items }: { items: PropertyItem[] }) {
  return (
    <div className="space-y-2 text-sm theme-muted">
      {items.map((item) => (
        <p key={item.label}>
          {item.label}: {item.value}
        </p>
      ))}
    </div>
  );
}
