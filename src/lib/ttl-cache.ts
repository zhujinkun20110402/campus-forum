import "server-only"

const store = new Map<string, { value: unknown; expiresAt: number }>()

/**
 * 进程内 TTL 缓存：Vercel 热容器中跨请求复用，减少数据库往返与函数时长。
 * 仅适用于全站共享、允许短暂延迟的数据（统计、热门、置顶、活跃用户等）。
 * 注意：Vercel 多实例间不共享缓存，冷启动或实例切换时表现为一次正常查询。
 */
export async function withTtl<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T
  }
  const value = await loader()
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
  // 防御性清理：缓存条目极少，仅在超过 100 条时清掉已过期项
  if (store.size > 100) {
    const now = Date.now()
    for (const [k, entry] of store) {
      if (entry.expiresAt <= now) store.delete(k)
    }
  }
  return value
}
