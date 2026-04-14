import { cn } from '@/common/utils/cn';
import type { VehicleCatalogItem } from '@/common/lib/vehicle-catalog';

type VehicleModelSelectorProps = {
  name: string;
  value?: string;
  options: VehicleCatalogItem[];
  onChange: (value: string) => void;
};

export function VehicleModelSelector({ name, value, options, onChange }: VehicleModelSelectorProps) {
  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value ?? ''} readOnly />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'group relative rounded-[22px] border p-3 text-left transition duration-300',
                'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-[22px] before:bg-white/65 before:opacity-70 before:content-[""] dark:before:bg-white/16',
                selected
                  ? 'border-[color:var(--line-strong)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(242,246,255,0.98))] shadow-[0_18px_40px_rgba(49,63,87,0.14)] ring-1 ring-[rgba(99,102,241,0.10)] dark:border-white/16 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] dark:shadow-[0_22px_46px_rgba(0,0,0,0.28)]'
                  : 'border-[color:var(--line)] bg-[color:var(--panel)] shadow-[0_10px_24px_rgba(49,63,87,0.08)] hover:border-[color:var(--line-strong)] hover:bg-[color:var(--panel-strong)] hover:shadow-[0_18px_36px_rgba(49,63,87,0.12)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.18)]',
              )}
              aria-pressed={selected}
            >
              <div
                className={cn(
                  'flex min-h-[132px] items-center justify-center rounded-[18px] border border-slate-200/80 bg-[linear-gradient(180deg,#f9fbff,#edf3ff)] px-3 py-4 transition duration-300 dark:border-white/8 dark:bg-[linear-gradient(180deg,#050912,#0a1220)]',
                  selected
                    ? '-translate-y-1.5 shadow-[0_18px_28px_rgba(15,23,42,0.18)]'
                    : 'group-hover:-translate-y-1 group-hover:shadow-[0_14px_24px_rgba(15,23,42,0.14)]',
                )}
              >
                <img
                  src={option.image.src}
                  alt={option.image.alt}
                  className={cn(
                    'max-h-[90px] w-full object-contain transition duration-300',
                    selected ? '-translate-y-1.5 scale-[1.06]' : 'group-hover:-translate-y-1 group-hover:scale-[1.04]',
                  )}
                  loading="lazy"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold theme-text">{option.shortLabel}</p>
                  <p className="mt-1 text-xs theme-muted">{option.value}</p>
                </div>
                <span className={cn(
                  'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                  selected
                    ? 'border border-slate-200/80 bg-white text-slate-900 dark:border-white/12 dark:bg-white/92 dark:text-slate-900'
                    : 'border border-[color:var(--line)] theme-muted',
                )}>
                  {selected ? 'Dipilih' : option.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
