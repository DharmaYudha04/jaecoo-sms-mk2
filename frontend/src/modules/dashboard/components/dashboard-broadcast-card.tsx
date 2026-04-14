import { useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { useBroadcasts, useBroadcastUnreadCount, useMarkBroadcastRead } from '@/modules/notifications/hooks/use-notifications';
import { cn } from '@/common/utils/cn';

function formatBroadcastTime(createdAt?: string | null) {
  if (!createdAt) return 'Belum ada waktu';
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return 'Belum ada waktu';
  return parsed.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DashboardBroadcastCard() {
  const navigate = useNavigate();
  const broadcastsQuery = useBroadcasts({ sort: 'newest', status: 'all', search: '' });
  const unreadCountQuery = useBroadcastUnreadCount();
  const markReadMutation = useMarkBroadcastRead();

  const latestBroadcast = broadcastsQuery.data?.[0];
  const unreadCount = unreadCountQuery.data ?? 0;
  const hasBroadcast = Boolean(latestBroadcast);

  const handleOpen = async () => {
    if (!latestBroadcast) {
      navigate('/broadcasts');
      return;
    }

    if (!latestBroadcast.isRead) {
      try {
        await markReadMutation.mutateAsync(latestBroadcast.id);
      } catch {
        // Keep navigation responsive even if mark-read fails.
      }
    }

    navigate(latestBroadcast.targetPath || '/broadcasts');
  };

  return (
    <Card className="dashboard-surface min-w-0 overflow-hidden p-0">
      <button
        type="button"
        onClick={() => {
          void handleOpen();
        }}
        className="dashboard-premium-card dashboard-interactive-card dashboard-broadcast-card flex h-full w-full min-w-0 flex-col justify-between rounded-[24px] border p-4 text-left md:min-h-[176px] md:p-5 xl:p-6"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] dashboard-broadcast-card__eyebrow">Broadcast terbaru</p>
            <h3
              className="dashboard-broadcast-card__title line-clamp-3 max-w-full text-xl font-semibold leading-tight break-words md:text-[1.75rem]"
              style={{ overflowWrap: 'anywhere' }}
              title={hasBroadcast ? latestBroadcast?.title : 'Belum ada broadcast'}
            >
              {hasBroadcast ? latestBroadcast?.title : 'Belum ada broadcast'}
            </h3>
          </div>
          {unreadCount > 0 ? <span className="dashboard-broadcast-card__badge">{unreadCount}</span> : null}
        </div>

        <div className="mt-4 min-w-0 flex-1">
          <p
            className={cn(
              'line-clamp-3 max-w-full text-xs leading-5 break-words md:text-sm md:leading-6',
              hasBroadcast ? 'dashboard-broadcast-card__message' : 'dashboard-broadcast-card__empty',
            )}
            style={{ overflowWrap: 'anywhere' }}
            title={hasBroadcast ? latestBroadcast?.message : 'Belum ada pengumuman baru. Card ini akan menampilkan broadcast terbaru dari sistem untuk semua role.'}
          >
            {hasBroadcast
              ? latestBroadcast?.message
              : 'Belum ada pengumuman baru. Card ini akan menampilkan broadcast terbaru dari sistem untuk semua role.'}
          </p>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] dashboard-broadcast-card__meta-label">Waktu</p>
            <p className="mt-1 text-sm font-semibold dashboard-broadcast-card__meta-value">{formatBroadcastTime(latestBroadcast?.createdAt)}</p>
          </div>

          <span className="dashboard-broadcast-card__open">
            {hasBroadcast ? 'Buka broadcast' : 'Lihat pusat broadcast'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14" strokeLinecap="round" />
              <path d="M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </button>
    </Card>
  );
}
