import { useEffect } from 'react';

type UseUnsavedChangesOptions = {
  when: boolean;
  message?: string;
};

export function useUnsavedChanges({ when, message = 'Anda memiliki perubahan yang belum disimpan.' }: UseUnsavedChangesOptions) {
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [message, when]);
}
