import type { User } from '@/common/types/domain';

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function inferNameFromEmail(email?: string | null) {
  if (!email) return '';
  const local = email.split('@')[0] ?? '';
  const normalized = local.replace(/[._-]+/g, ' ').trim();
  return normalized ? toTitleCase(normalized) : '';
}

export function getPreferredDisplayName(user?: Pick<User, 'fullName' | 'email'> | null) {
  const fullName = user?.fullName?.trim();
  if (fullName) return fullName;
  const inferred = inferNameFromEmail(user?.email ?? null);
  if (inferred) return inferred;
  return 'Pengguna JAECOO';
}
