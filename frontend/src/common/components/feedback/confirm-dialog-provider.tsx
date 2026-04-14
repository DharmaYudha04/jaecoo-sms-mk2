import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/common/components/ui/button';

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

function ConfirmDialog({ pending, onResolve }: { pending: PendingConfirm; onResolve: (value: boolean) => void }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-lg rounded-[30px] border border-[color:var(--line)] p-6 theme-text shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <p className="text-xs uppercase tracking-[0.28em] theme-muted">Konfirmasi</p>
        <h2 className="mt-3 text-2xl font-semibold">{pending.title}</h2>
        {pending.description ? <p className="mt-3 text-sm theme-muted">{pending.description}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => onResolve(false)}>
            {pending.cancelLabel ?? 'Batal'}
          </Button>
          <Button type="button" variant={pending.tone === 'danger' ? 'danger' : 'primary'} onClick={() => onResolve(true)}>
            {pending.confirmLabel ?? 'Lanjutkan'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialogProvider({ children }: PropsWithChildren) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const handleResolve = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {pending ? <ConfirmDialog pending={pending} onResolve={handleResolve} /> : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  }
  return context;
}
