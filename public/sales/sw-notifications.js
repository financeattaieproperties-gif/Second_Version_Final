/**
 * Attaie Properties Sales PWA - Service Worker Notifications Extension
 * Handles background push notifications, client message alerts, and notification click navigation on mobile devices.
 */

// Background push notification listener (Web Push / Firebase Cloud Messaging)
self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        title: 'New Lead Assigned · Attaie Properties',
        body: event.data.text(),
      };
    }
  }

  const title = payload.title || 'New Lead Assigned · Attaie Properties';
  const leadId = payload.leadId || payload.id;
  const leadSerial = payload.serial || (leadId ? `#${leadId}` : '');

  const options = {
    body:
      payload.body ||
      (payload.customerName
        ? `Lead ${leadSerial} (${payload.customerName}) has been assigned to your sales queue.`
        : 'A new customer inquiry has been assigned to you for immediate follow-up.'),
    icon: payload.icon || './pwa-192x192.png',
    badge: payload.badge || './pwa-192x192.png',
    tag: payload.tag || (leadId ? `lead-assigned-${leadId}` : `lead-${Date.now()}`),
    data: {
      url: payload.url || (leadId ? `/sales/leads?id=${leadId}` : '/sales/leads'),
      leadId,
      assignedAt: payload.assignedAt || new Date().toISOString(),
    },
    // Distinctive mobile vibration pattern: vibrate 200ms, pause 100ms, vibrate 200ms
    vibrate: [200, 100, 200, 100, 200],
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'open_lead', title: 'Open Lead' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click and action handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/sales/leads';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a Sales PWA window or tab is already open, focus it and navigate
        for (const client of clientList) {
          if (
            client.url &&
            (client.url.includes('/sales') || client.url.includes('/dashboard')) &&
            'focus' in client
          ) {
            if ('navigate' in client) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        // Otherwise open a new standalone window to the target URL
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// Notification close tracking (optional telemetry/cleanup)
self.addEventListener('notificationclose', (event) => {
  // Notification closed without action
});

// Client postMessage interface (foreground tabs dispatching to Service Worker)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_LEAD_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || 'New Lead Assigned · Attaie Properties', {
        icon: './pwa-192x192.png',
        badge: './pwa-192x192.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        ...options,
      })
    );
  }

  if (event.data.type === 'PING_NOTIFICATIONS') {
    event.ports?.[0]?.postMessage({ type: 'PONG_NOTIFICATIONS', supported: true });
  }
});
