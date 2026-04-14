import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/common/components/ui/button';
import { cn } from '@/common/utils/cn';

type ToastTone = 'success' | 'error' | 'info';

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastViewport({ items, onClose }: { items: ToastItem[]; onClose: (id: string) => void }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-3 px-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'pointer-events-auto flex w-full max-w-md items-start justify-between gap-4 rounded-[24px] border px-4 py-4 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl',
            item.tone === 'success' && 'border-emerald-300/24 bg-emerald-500/14 theme-text',
            item.tone === 'error' && 'border-red-300/24 bg-red-500/14 theme-text',
            (!item.tone || item.tone === 'info') && 'border-[color:var(--line)] bg-[color:var(--panel)] theme-text',
          )}
          role="status"
          aria-live="polite"
        >
          <div>
            <p className="text-sm font-semibold">{item.title}</p>
            {item.description ? <p className="mt-1 text-sm opacity-80">{item.description}</p> : null}
          </div>
          <Button type="button" variant="ghost" className="min-h-0 px-2 py-1 text-xs" onClick={() => onClose(item.id)}>
            Tutup
          </Button>
        </div>
      ))}
    </div>,
    document.body,
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const closeToast = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nextItem: ToastItem = { id, tone: 'info', durationMs: 3800, ...input };
    setItems((current) => [...current, nextItem]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, nextItem.durationMs);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onClose={closeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
