/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/* eslint no-console: ["error", { allow: ["info"] }] */

// console.info(
//   'Service worker disabled for development, will be generated at build time.'
// );

self.addEventListener('notificationclick', function (e) {

  // console.log(self.registration.getNotifications({ tag: 'ubc-notification' }));
  e.notification.close();

  e.waitUntil(
    clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(windowClients => {

      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        if ('focus' in client) {
          return client.focus();
        }
      }

      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(e.notification.data.url);
      }

    })
  );
});