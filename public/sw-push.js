/**
 * Minimal service worker for push notifications only (scope /push/).
 * Activates quickly so "Allow notifications" does not time out.
 */
'use strict';

self.addEventListener('push', function (event) {
  var payloadPromise = Promise.resolve({ title: 'Notification', body: '' });
  if (event.data) {
    try {
      payloadPromise = Promise.resolve(event.data.json()).catch(function () {
        return Promise.resolve(event.data.text()).then(function (text) {
          try {
            return JSON.parse(text) || { title: 'Notification', body: text };
          } catch (e) {
            return { title: 'Notification', body: text };
          }
        });
      });
    } catch (e) {
      payloadPromise = Promise.resolve({ title: 'Notification', body: '' });
    }
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      var appIsVisible = clientList.some(function (c) {
        return c.visibilityState === 'visible' || (c.focused === true);
      });
      if (appIsVisible) return; // User is in app; WebSocket toast will show instead.

      return payloadPromise.then(function (data) {
        var raw = data || {};
        var dataObj = raw.data || raw.notification || raw;
        var title = (dataObj.title != null) ? String(dataObj.title) : (raw.title != null) ? String(raw.title) : 'Notification';
        var body = (dataObj.body != null) ? String(dataObj.body) : (raw.body != null) ? String(raw.body) : '';
        var id = (dataObj.id != null) ? String(dataObj.id) : (raw.id != null) ? String(raw.id) : (raw.notificationId != null) ? String(raw.notificationId) : (dataObj.notificationId != null) ? String(dataObj.notificationId) : '';
        var baseUrl = (dataObj.url != null) ? String(dataObj.url) : (raw.url != null) ? String(raw.url) : '/employees/notification';
        var url = id ? baseUrl + (baseUrl.indexOf('?') >= 0 ? '&' : '?') + 'id=' + encodeURIComponent(id) : baseUrl;
        var tag = id ? 'notif-' + id : 'notification-' + Date.now();
        var opts = { body: body, icon: '/icons/192.png', badge: '/icons/192.png', tag: tag, data: { title: title, body: body, id: id, url: url }, requireInteraction: false, silent: false };
        return self.registration.showNotification(title, opts).then(null, function () {
          return showPushFallback(title, body, url);
        });
      }).catch(function () {
        return showPushFallback('Notification', 'You have a new notification.', '/employees/notification');
      });
    })
  );

  function showPushFallback(notifTitle, notifBody, notifUrl) {
    var u = notifUrl || '/employees/notification';
    return self.registration.showNotification(notifTitle, { body: notifBody, tag: 'notification-fallback-' + Date.now(), data: { url: u }, silent: false }).then(null, function () {
      return self.registration.showNotification('New notification', { body: 'Tap to open.', tag: 'minimal-' + Date.now() }).catch(function () {});
    });
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/employees/notification';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
