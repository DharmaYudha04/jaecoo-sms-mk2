export function FormDirtyBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="rounded-[22px] border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-[color:var(--accent-strong)]">
      Ada perubahan yang belum disimpan.
    </div>
  );
}
