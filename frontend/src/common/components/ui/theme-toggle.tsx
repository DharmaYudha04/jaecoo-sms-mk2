import { useTheme } from '@/common/theme/theme-provider';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Ganti ke mode ${nextTheme === 'dark' ? 'gelap' : 'terang'}`}
      title={`Mode ${nextTheme === 'dark' ? 'gelap' : 'terang'}`}
      className={[
        'inline-flex h-12 items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-3 text-sm font-semibold text-[color:var(--text)] shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5',
        className,
      ].join(' ')}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--panel-light)] text-base shadow-inner">
        {theme === 'dark' ? '☀' : '☾'}
      </span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
