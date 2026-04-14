import { useEffect, useState } from 'react';
import { subscribeToUnseenChanges } from '@/common/lib/unseen-notifications';

export function useUnseenRefresh() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeToUnseenChanges(() => {
    setRevision((current) => current + 1);
  }), []);

  return revision;
}
