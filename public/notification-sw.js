self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url
  if (!targetUrl) return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ('navigate' in client) await client.navigate(targetUrl)
        if ('focus' in client) return client.focus()
      }

      return self.clients.openWindow(targetUrl)
    }),
  )
})
