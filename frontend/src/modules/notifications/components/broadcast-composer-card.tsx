import { FormEvent, useMemo, useState } from 'react';
import type { Role } from '@/common/types/domain';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { Button } from '@/common/components/ui/button';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { useSendBroadcast } from '@/modules/notifications/hooks/use-notifications';
import { useToast } from '@/common/components/feedback/toast-provider';
import { getErrorMessage } from '@/common/lib/request-error';

const roles: Role[] = ['ADMIN', 'MANAGER', 'FRONTLINE', 'MEKANIK'];

export function BroadcastComposerCard() {
  const user = useAuthStore((state) => state.user);
  const sendBroadcastMutation = useSendBroadcast();
  const { showToast } = useToast();
  const targetRoles = useMemo(() => roles, []);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast({ title: 'Broadcast belum lengkap', description: 'Isi judul dan pesan broadcast terlebih dahulu.', tone: 'error' });
      return;
    }

    try {
      await sendBroadcastMutation.mutateAsync({ title: title.trim(), message: message.trim(), targetRoles });
      setTitle('');
      setMessage('');
      showToast({ title: 'Broadcast terkirim', description: 'Pengumuman berhasil dikirim ke semua role, termasuk akun pengirim.', tone: 'success' });
    } catch (error) {
      showToast({ title: 'Broadcast gagal', description: getErrorMessage(error, 'Gagal mengirim broadcast.'), tone: 'error' });
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] theme-muted">Broadcast baru</p>
        <h3 className="mt-2 text-lg font-semibold theme-text">Kirim pengumuman ke seluruh tim</h3>
        <p className="mt-1 text-sm theme-muted">Broadcast otomatis dikirim ke semua role aktif, termasuk akun pengirim agar informasinya tetap konsisten di semua pihak.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Judul broadcast" maxLength={100} />
        <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tulis pengumuman singkat, jelas, dan mudah dipahami semua pengguna." maxLength={500} />

        <div className="flex justify-end">
          <Button type="submit" disabled={sendBroadcastMutation.isPending}>
            {sendBroadcastMutation.isPending ? 'Mengirim...' : 'Kirim broadcast'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
