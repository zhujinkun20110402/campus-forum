import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare 配置。
 * 论坛全站动态渲染、不使用 ISR，因此暂不接入 R2 增量缓存
 * （需要时按官方文档添加 r2IncrementalCache + R2 绑定）。
 */
export default defineCloudflareConfig({});
