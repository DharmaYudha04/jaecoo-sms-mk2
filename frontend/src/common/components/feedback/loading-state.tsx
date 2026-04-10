export function LoadingState({
  message = 'Memuat data...',
  rows = 3,
}: {
  message?: string;
  rows?: number;
}) {
  return (
    <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-5">
      <p className="text-sm theme-muted">{message}</p>
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
            <div className="h-3 w-32 rounded-full bg-white/10" />
            <div className="mt-3 h-3 w-3/4 rounded-full bg-white/10" />
            <div className="mt-2 h-3 w-1/2 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
