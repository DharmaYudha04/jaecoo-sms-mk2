export function ErrorState({
  message,
  description,
}: {
  message: string;
  description?: string;
}) {
  return (
    <div className="rounded-[24px] border border-rose-300/22 bg-rose-400/12 p-5">
      <p className="text-sm font-semibold theme-text">{message}</p>
      {description ? <p className="mt-2 text-sm theme-muted">{description}</p> : null}
    </div>
  );
}
