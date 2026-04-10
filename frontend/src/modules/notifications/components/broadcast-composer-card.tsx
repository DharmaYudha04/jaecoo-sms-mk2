import { FormEvent, useMemo, useState } from 'react';
import { roleLabels } from '@/common/lib/authz';
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
  const defaultTargets = useMemo(() => roles.filter((role) => role !== user?.role), [user?.role]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRoles, setTargetRoles] = useState<Role[]>(defaultTargets);

  const toggleRole = (role: Role) => {
    setTargetRoles((current) => (current.includes(role) ? current.filter((item) => item !== role) : [...current, role]));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !message.trim() || targetRoles.length === 0) {
      showToast({ title: 'Broadcast belum lengkap', description: 'Isi judul, pesan, dan pilih minimal satu role tujuan.', tone: 'error' });
      return;
    }

    try {
      await sendBroadcastMutation.mutateAsync({ title: title.trim(), message: message.trim(), targetRoles });
      setTitle('');
      setMessage('');
      setTargetRoles(defaultTargets);
      showToast({ title: 'Broadcast terkirim', description: 'Pesan broadcast berhasil dikirim ke role tujuan.', tone: 'success' });
    } catch (error) {
      showToast({ title: 'Broadcast gagal', description: getErrorMessage(error, 'Gagal mengirim broadcast.'), tone: 'error' });
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] theme-muted">Broadcast baru</p>
        <h3 className="mt-2 text-lg font-semibold theme-text">Kirim informasi cepat ke role lain</h3>
        <p className="mt-1 text-sm theme-muted">Pengirim otomatis tidak menerima broadcast sendiri.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Judul broadcast" maxLength={100} />
        <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tulis pesan singkat, jelas, dan mudah dipahami semua pengguna." maxLength={500} />

        <div className="space-y-2">
          <p className="text-sm font-medium theme-text">Kirim ke role</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {roles.map((role) => {
              const disabled = role === user?.role;
              const checked = disabled ? false : targetRoles.includes(role);
              return (
                <label key={role} className="flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-light)] px-4 py-3 text-sm theme-text">
                  <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleRole(role)} />
                  <span>{roleLabels[role]}{disabled ? ' (role Anda)' : ''}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={sendBroadcastMutation.isPending}>
            {sendBroadcastMutation.isPending ? 'Mengirim...' : 'Kirim broadcast'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
