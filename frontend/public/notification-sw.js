self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'JAECOO Notification';
  const options = {
    body: data.body || '',
    tag: data.tag || 'jaecoo-notification',
    data: {
      url: data.url || '/notifications',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';
  event.waitUntil(clients.openWindow(url));
});
