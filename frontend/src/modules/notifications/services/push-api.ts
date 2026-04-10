import { apiClient } from '@/services/api-client';
import { endpoints } from '@/services/endpoints';

type PushPublicConfig = {
  supported: boolean;
  publicKey: string | null;
};

export async function getPushPublicConfig(): Promise<PushPublicConfig> {
  const { data } = await apiClient.get<PushPublicConfig>(endpoints.notifications.pushPublicKey);
  return data;
}

export async function subscribePushDevice(subscription: PushSubscription) {
  await apiClient.post(endpoints.notifications.pushSubscribe, subscription);
}

export async function unsubscribePushDevice(endpoint: string) {
  await apiClient.delete(endpoints.notifications.pushSubscribe, { data: { endpoint } });
}
