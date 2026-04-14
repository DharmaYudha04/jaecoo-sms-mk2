import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { Button } from '@/common/components/ui/button';
import { TrashIcon } from '@/common/components/ui/action-icons';
import { ListCard } from '@/common/components/data-display/list-card';
import { PageHeader } from '@/common/components/page/page-header';
import { PermissionGate } from '@/common/components/auth/permission-gate';
import { useDeleteUser, useUpdateUser, useUsers } from '@/modules/users/hooks/use-users';
import { mapUserToListRow } from '@/modules/users/mappers/user-mappers';
import type { UserListRow } from '@/modules/users/types/user.types';
import type { User } from '@/common/types/domain';
import { getErrorMessage } from '@/common/lib/request-error';
import { Select } from '@/common/components/ui/select';
import { Input } from '@/common/components/ui/input';
import { useToast } from '@/common/components/feedback/toast-provider';
import { useConfirm } from '@/common/components/feedback/confirm-dialog-provider';
import { hasPermission } from '@/common/lib/authz';
import { useAuthStore } from '@/modules/auth/store/auth-store';

const roleOptions: User['role'][] = ['ADMIN', 'MANAGER', 'FRONTLINE', 'MEKANIK'];

export function UserManagementPage() {
  const usersQuery = useUsers();
  const users = usersQuery.data;
  const role = useAuthStore((state) => state.user?.role);
  const currentUser = useAuthStore((state) => state.user);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [draftFullName, setDraftFullName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftRole, setDraftRole] = useState<User['role']>('FRONTLINE');
  const [draftActive, setDraftActive] = useState(true);
  const [draftPassword, setDraftPassword] = useState('');

  const rows = useMemo(() => (users?.length ? users.map(mapUserToListRow) : []), [users]);

  const displayRows: UserListRow[] = useMemo(() => rows, [rows]);

  const userByEmail = useMemo(() => new Map((users ?? []).map((item) => [item.email, item])), [users]);

  const startEdit = (user: User) => {
    setEditingUserId(user.id_user);
    setDraftFullName(user.fullName ?? '');
    setDraftEmail(user.email);
    setDraftRole(user.role);
    setDraftActive(user.isActive);
    setDraftPassword('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Pegawai"
        title="Pegawai"
        actions={(
          <PermissionGate permission="users:update">
            <Link to="/users/new"><Button type="button">Tambah User Baru +</Button></Link>
          </PermissionGate>
        )}
      />
      <Card>
        {usersQuery.isLoading ? (
          <LoadingState message="Memuat daftar pegawai..." rows={4} />
        ) : usersQuery.isError ? (
          <EmptyState message={getErrorMessage(usersQuery.error, 'Gagal memuat data pegawai dari server.')} />
        ) : displayRows.length === 0 ? (
          <EmptyState message="Belum ada data pegawai yang tersedia." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {displayRows.map((row) => {
              const user = userByEmail.get(row.email);
              const isEditing = user && editingUserId === user.id_user;
              return (
                <Card key={row.email} className="space-y-4">
                  <ListCard
                    title={row.fullName !== '-' ? row.fullName : row.email}
                    subtitle={(
                      <>
                        <p className="mt-3">Email: {row.email}</p>
                        <p className="mt-1">Role: {row.role}</p>
                        <p className="mt-1">Status: {row.status}</p>
                      </>
                    )}
                    meta={<span className="text-xs theme-muted">Kelola email, role, status aktif, reset password, dan nonaktifkan user bila diperlukan.</span>}
                    className="border-none bg-transparent p-0"
                  />

                  {user && isEditing ? (
                    <div className="space-y-3 rounded-[18px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <p className="mb-2 text-xs uppercase tracking-[0.18em] theme-muted">Nama Lengkap</p>
                          <Input value={draftFullName} onChange={(event) => setDraftFullName(event.target.value)} placeholder="Nama pegawai" />
                        </div>
                        <div className="md:col-span-2">
                          <p className="mb-2 text-xs uppercase tracking-[0.18em] theme-muted">Email</p>
                          <Input value={draftEmail} onChange={(event) => setDraftEmail(event.target.value)} placeholder="nama@service.com" />
                        </div>
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-[0.18em] theme-muted">Role</p>
                          <Select value={draftRole} onChange={(event) => setDraftRole(event.target.value as User['role'])}>
                            {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </Select>
                        </div>
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-[0.18em] theme-muted">Status</p>
                          <Select value={draftActive ? 'active' : 'inactive'} onChange={(event) => setDraftActive(event.target.value === 'active')}>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <p className="mb-2 text-xs uppercase tracking-[0.18em] theme-muted">Reset Password (opsional)</p>
                          <Input value={draftPassword} onChange={(event) => setDraftPassword(event.target.value)} placeholder="Kosongkan jika tidak ingin mengubah password" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={async () => {
                            const trimmedEmail = draftEmail.trim().toLowerCase();
                            if (!trimmedEmail) {
                              showToast({ title: 'Email wajib diisi', description: 'Masukkan email yang valid sebelum menyimpan.', tone: 'error' });
                              return;
                            }
                            try {
                              const updatedUser = await updateUserMutation.mutateAsync({
                                id: user.id_user,
                                payload: {
                                  fullName: draftFullName.trim(),
                                  email: trimmedEmail,
                                  role: draftRole,
                                  isActive: draftActive,
                                  password: draftPassword.trim() ? draftPassword : undefined,
                                },
                              });
                              if (currentUser?.id_user === updatedUser.id_user) {
                                await bootstrapSession();
                              }
                              showToast({ title: 'User diperbarui', description: 'Perubahan data pegawai berhasil disimpan.', tone: 'success' });
                              setEditingUserId(null);
                            } catch (error) {
                              showToast({ title: 'Gagal memperbarui user', description: getErrorMessage(error, 'Periksa data lalu coba lagi.'), tone: 'error' });
                            }
                          }}
                          disabled={updateUserMutation.isPending}
                        >
                          {updateUserMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setEditingUserId(null)}>Batal</Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    {user && hasPermission(role, 'users:update') ? <Button type="button" variant="secondary" onClick={() => startEdit(user)}>Edit</Button> : null}
                    {user && hasPermission(role, 'users:delete') ? (
                      <Button
                        type="button"
                        variant="danger"
                        disabled={deleteUserMutation.isPending}
                        onClick={async () => {
                          const approved = await confirm({
                            title: 'Hapus / nonaktifkan user?',
                            description: 'User akan dinonaktifkan dari sistem. Riwayat tetap tersimpan.',
                            confirmLabel: 'Nonaktifkan',
                            tone: 'danger',
                          });
                          if (!approved) return;
                          try {
                            await deleteUserMutation.mutateAsync(user.id_user);
                            showToast({ title: 'User dinonaktifkan', description: 'Akun berhasil dinonaktifkan.', tone: 'success' });
                          } catch (error) {
                            showToast({ title: 'Gagal menonaktifkan user', description: getErrorMessage(error, 'Masih ada work order aktif atau terjadi kesalahan backend.'), tone: 'error' });
                          }
                        }}
                      >
                        <><TrashIcon className="mr-2 h-4 w-4" />{deleteUserMutation.isPending ? 'Memproses...' : 'Hapus'}</>
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
