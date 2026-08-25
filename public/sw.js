/**
 * 学生论坛 Service Worker
 *
 * 目前只做两件事：
 * 1. 满足旧版 Chromium 的 PWA 安装条件（新版不再强制要求 SW）
 * 2. 为后续 Web Push（Phase 1/2）预留 —— 未来在这里监听 push / notificationclick
 *
 * 刻意不注册 fetch 监听器：不缓存任何页面。
 * 本站所有页面都是登录态动态内容，缓存只会带来过期数据问题。
 */

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})
