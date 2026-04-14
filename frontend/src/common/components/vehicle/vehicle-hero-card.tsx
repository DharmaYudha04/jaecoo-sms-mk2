import { getVehicleCatalogItemByModel } from '@/common/lib/vehicle-catalog';
import { cn } from '@/common/utils/cn';

type VehicleHeroCardProps = {
  model?: string | null;
  plate?: string | null;
  vin?: string | null;
  className?: string;
};

export function VehicleHeroCard({ model, className = '' }: VehicleHeroCardProps) {
  const vehicle = getVehicleCatalogItemByModel(model);

  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 shadow-[0_18px_38px_rgba(49,63,87,0.12)]',
        'border-slate-200/80 bg-[linear-gradient(160deg,#ffffff_0%,#f5f8ff_56%,#ebf1ff_100%)]',
        'dark:border-[color:var(--line)] dark:bg-[linear-gradient(160deg,#0b0f18_0%,#121926_52%,#1a2332_100%)] dark:shadow-[0_20px_42px_rgba(2,6,23,0.24)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-white/60">Identifikasi Unit</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{vehicle.value}</h3>
        </div>
        <span className="rounded-full border border-slate-300/90 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/18 dark:bg-white/8 dark:text-white/82">
          {vehicle.badge}
        </span>
      </div>
      <div className="mt-4 flex h-48 items-center justify-center rounded-[22px] border border-slate-200/90 bg-[radial-gradient(circle_at_top,rgba(115,145,210,0.14),transparent_58%),linear-gradient(180deg,#ffffff,#eef4ff)] p-4 dark:border-white/6 dark:bg-[radial-gradient(circle_at_top,rgba(65,90,140,0.2),transparent_58%),linear-gradient(180deg,rgba(2,6,23,0.82),rgba(2,6,23,0.92))]">
        <img src={vehicle.image.src} alt={vehicle.image.alt} className="max-h-36 w-auto object-contain drop-shadow-[0_12px_22px_rgba(148,163,184,0.32)] dark:drop-shadow-[0_18px_28px_rgba(15,23,42,0.45)]" loading="lazy" />
      </div>
    </div>
  );
}
