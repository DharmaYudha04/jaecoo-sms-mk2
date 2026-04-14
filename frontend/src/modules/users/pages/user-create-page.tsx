import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { FieldError, FieldHint, FieldLabel } from '@/common/components/forms/form-field';
import { FormShell } from '@/common/components/forms/form-shell';
import { FormDirtyBanner } from '@/common/components/forms/form-dirty-banner';
import { PayloadPreview } from '@/common/components/forms/payload-preview';
import { PageHeader } from '@/common/components/page/page-header';
import { useToast } from '@/common/components/feedback/toast-provider';
import { useConfirm } from '@/common/components/feedback/confirm-dialog-provider';
import { useUnsavedChanges } from '@/common/hooks/use-unsaved-changes';
import { useCreateUser } from '@/modules/users/hooks/use-users';
import { getErrorMessage } from '@/common/lib/request-error';
import type { CreateUserPayload } from '@/modules/users/types/user.types';

const schema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['MEKANIK', 'FRONTLINE', 'MANAGER', 'ADMIN']),
  isActive: z.enum(['true', 'false']).default('true'),
});

type FormValues = z.infer<typeof schema>;

export function UserCreatePage() {
  const [lastPayload, setLastPayload] = useState<CreateUserPayload>();
  const [submitState, setSubmitState] = useState<string>();
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', role: 'FRONTLINE', isActive: 'true' },
  });

  useUnsavedChanges({ when: isDirty });

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateUserPayload = {
      fullName: values.fullName.trim(),
      email: values.email,
      password: values.password,
      role: values.role,
      isActive: values.isActive === 'true',
    };
    setLastPayload(payload);


    try {
      await createUserMutation.mutateAsync(payload);
      setSubmitState('Pegawai berhasil dibuat di server.');
      showToast({ title: 'Pegawai ditambahkan', description: 'Akun baru berhasil dibuat dan tersimpan di database.', tone: 'success' });
      navigate('/users');
    } catch (error) {
      setSubmitState('Gagal membuat pegawai. Tidak ada data lokal yang dibuat.');
      showToast({ title: 'Gagal menambahkan pegawai', description: getErrorMessage(error, 'Akun baru tidak berhasil dibuat di server.'), tone: 'error' });
    }
  });

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Pegawai" title="Tambah Pegawai" />
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <FormShell eyebrow="Form" title="Input Pegawai Baru">
          <FormDirtyBanner visible={isDirty} />
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="md:col-span-2">
              <FieldLabel htmlFor="fullName">Nama Lengkap</FieldLabel>
              <Input id="fullName" placeholder="Nama pegawai" {...register('fullName')} />
              <FieldError>{errors.fullName?.message}</FieldError>
            </div>
            <div className="md:col-span-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" placeholder="nama@service.com" {...register('email')} />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div className="md:col-span-2">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" placeholder="Password awal" {...register('password')} />
              <FieldHint>Backend akan menyimpan password dalam bentuk hash.</FieldHint>
              <FieldError>{errors.password?.message}</FieldError>
            </div>
            <div>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select id="role" {...register('role')}>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="FRONTLINE">FRONTLINE</option>
                <option value="MEKANIK">MEKANIK</option>
              </Select>
            </div>
            <div>
              <FieldLabel htmlFor="isActive">Status</FieldLabel>
              <Select id="isActive" {...register('isActive')}>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </Select>
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSubmitting || createUserMutation.isPending}>Simpan Pegawai</Button>
              <Button type="button" variant="secondary" onClick={async () => {
                if (!isDirty) {
                  navigate('/users');
                  return;
                }
                const approved = await confirm({ title: 'Batalkan input pegawai?', description: 'Perubahan yang belum disimpan akan hilang.' });
                if (approved) navigate('/users');
              }}>Batal</Button>
              <Button type="button" variant="secondary" onClick={async () => {
                if (!isDirty) return reset();
                const approved = await confirm({ title: 'Reset form pegawai?', description: 'Perubahan yang belum disimpan akan hilang.' });
                if (approved) reset();
              }}>Reset</Button>
              {submitState ? <span className="text-sm theme-muted">{submitState}</span> : null}
            </div>
          </form>
        </FormShell>
        <PayloadPreview title="Payload Pegawai" payload={lastPayload} />
      </div>
    </div>
  );
}
