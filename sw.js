/* WeJobs.ro — Service Worker pentru notificări push (admin) */

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }

  const title = data.title || "WeJobs.ro";
  const options = {
    body: data.body || "Ai o notificare nouă.",
    icon: "/assets/images/logo-wejobs-header.png",
    badge: "/assets/images/logo-wejobs-header.png",
    tag: data.tag || "wejobs",
    data: { url: data.url || "/admin.html" },
    vibrate: [120, 60, 120],
    requireInteraction: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin.html";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes("/admin") && "focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
