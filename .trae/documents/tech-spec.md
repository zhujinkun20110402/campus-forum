# 技术架构文档 — 校园论坛前端重构

## 一、技术栈概览

| 层级   | 技术                           | 版本         | 说明                                          |
| ---- | ---------------------------- | ---------- | ------------------------------------------- |
| 框架   | Next.js                      | 16.2.6     | App Router, React Server Components         |
| 语言   | TypeScript                   | 5.x        | 严格模式                                        |
| 样式   | Tailwind CSS                 | 4.x        | `@import "tailwindcss"` 语法                  |
| UI组件 | 自研 + shadcn/ui 模式            | -          | 基于 CVA + Tailwind                           |
| 字体   | next/font/google             | -          | Noto Serif SC, Noto Sans SC, JetBrains Mono |
| 图标   | Lucide React                 | 1.16       | 全站统一                                        |
| 动效   | CSS + Canvas + Framer Motion | -          | 按场景选择                                       |
| 表单   | React Hook Form + Zod        | -          | 保留现有                                        |
| 认证   | Auth.js v5 (next-auth)       | 5.0.0-beta | 保留现有                                        |
| 数据库  | Prisma + PostgreSQL          | 7.8        | 保留现有，不修改 Schema                             |

***

## 二、项目文件结构

```
campus-forum/
├── prisma/
│   ├── schema.prisma          # 不变
│   └── seed.ts                # 不变
├── public/
│   ├── avatars/               # 保留
│   ├── images/
│   │   ├── school-logo.png    # 新增：校徽占位
│   │   ├── home-hero.jpg      # 保留/替换
│   │   ├── auth-decoration.jpg # 保留/替换
│   │   ├── confession-bg.jpg  # 保留/替换
│   │   ├── profile-cover.jpg  # 新增：个人封面
│   │   ├── campus-01.jpg ~ campus-06.jpg  # 新增：校园风采
│   │   └── construction.svg   # 保留
│   └── uploads/               # 用户上传
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # 根布局（字体、主题、全局样式）
│   │   ├── globals.css        # Tailwind v4 + 自定义变量
│   │   ├── page.tsx           # 首页
│   │   ├── loading.tsx        # 全局加载态
│   │   ├── error.tsx          # 全局错误边界
│   │   ├── admin/page.tsx
│   │   ├── api/               # API路由（不变）
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── category/[slug]/page.tsx
│   │   ├── confession/page.tsx
│   │   ├── post/
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── profile/
│   │   │   ├── [id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── search/page.tsx
│   ├── components/
│   │   ├── ui/                # 基础UI组件（Button, Input, Card等）
│   │   ├── layout/            # 布局组件
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── mobile-nav.tsx # 新增：移动端导航
│   │   │   └── providers.tsx
│   │   ├── effects/           # 动效组件
│   │   │   ├── academic-particles.tsx   # 学院粒子场（重构）
│   │   │   ├── motto-stream.tsx         # 校训文字流动效（新增）
│   │   │   ├── scroll-reveal.tsx        # 滚动揭示（保留优化）
│   │   │   ├── count-up.tsx             # 数字滚动（新增）
│   │   │   ├── card-shine.tsx           # 卡片光泽（新增HOC）
│   │   │   └── magnetic-hover.tsx       # 磁性悬停（新增HOC）
│   │   ├── home/
│   │   │   ├── hero-section.tsx         # 新增：Hero区
│   │   │   ├── motto-bar.tsx            # 新增：校训展示条
│   │   │   ├── category-grid.tsx        # 新增：版块网格
│   │   │   ├── campus-gallery.tsx       # 新增：校园风采
│   │   │   ├── stats-counter.tsx        # 新增：统计区
│   │   │   └── feed-loader.tsx          # 保留：无限滚动
│   │   ├── post/
│   │   │   ├── post-card.tsx            # 重构：帖子卡片
│   │   │   ├── post-list.tsx            # 保留
│   │   │   ├── post-form.tsx            # 重构：发帖表单
│   │   │   ├── like-button.tsx          # 保留优化
│   │   │   ├── delete-button.tsx        # 保留
│   │   │   └── share-button.tsx         # 新增：分享按钮
│   │   ├── comment/
│   │   │   ├── comment-form.tsx
│   │   │   ├── comment-list.tsx
│   │   │   ├── comment-item.tsx         # 新增：单条评论
│   │   │   └── delete-comment-button.tsx
│   │   ├── confession/
│   │   │   └── confession-form.tsx      # 重构
│   │   ├── profile/
│   │   │   ├── profile-header.tsx       # 新增：个人资料头
│   │   │   ├── profile-tabs.tsx         # 新增：标签页
│   │   │   ├── avatar-selector.tsx      # 保留
│   │   │   └── profile-form.tsx         # 保留
│   │   ├── admin/
│   │   │   ├── stat-cards.tsx           # 新增：统计卡片
│   │   │   ├── trend-chart.tsx          # 新增：趋势图（CSS实现）
│   │   │   ├── user-table.tsx           # 新增：用户表格
│   │   │   └── post-table.tsx           # 新增：帖子表格
│   │   └── theme/
│   │       ├── theme-provider.tsx       # 保留优化
│   │       └── theme-toggle.tsx         # 保留优化
│   ├── hooks/
│   │   ├── use-scroll-direction.ts      # 新增：滚动方向检测
│   │   ├── use-intersection.ts          # 新增：IntersectionObserver封装
│   │   ├── use-count-up.ts              # 新增：数字滚动逻辑
│   │   ├── use-local-storage.ts         # 新增：localStorage封装
│   │   └── use-media-query.ts           # 新增：响应式检测
│   ├── lib/
│   │   ├── auth.ts                      # 保留
│   │   ├── prisma.ts                    # 保留
│   │   ├── utils.ts                     # 保留扩展
│   │   ├── actions.ts                   # 保留扩展
│   │   └── validations.ts               # 保留
│   └── types/
│       └── next-auth.d.ts               # 保留
├── .trae/documents/
│   ├── design-prd.md
│   └── tech-spec.md
├── next.config.ts
├── tailwind.config.ts                   # 新增：扩展配置
├── tsconfig.json
└── package.json
```

***

## 三、组件架构

### 3.1 组件分层

```
┌─────────────────────────────────────────┐
│  Page（页面）                            │
│  - 数据获取（Server Component）           │
│  - 布局组合                              │
├─────────────────────────────────────────┤
│  Section（区块）                         │
│  - HeroSection, CategoryGrid, etc.      │
│  - 业务逻辑 + 布局                       │
├─────────────────────────────────────────┤
│  Component（组件）                       │
│  - PostCard, CommentItem, etc.          │
│  - 复用UI + 交互                         │
├─────────────────────────────────────────┤
│  Effect（动效）                          │
│  - AcademicParticles, MottoStream, etc. │
│  - 纯视觉，无业务逻辑                     │
├─────────────────────────────────────────┤
│  UI Primitive（基础UI）                  │
│  - Button, Input, Card, Badge, etc.     │
│  - 原子组件，无业务逻辑                    │
└─────────────────────────────────────────┘
```

### 3.2 Server Component vs Client Component 划分

| 类型         | 组件                  | 理由                    |
| ---------- | ------------------- | --------------------- |
| **Server** | `page.tsx`（所有页面）    | 数据获取、SEO              |
| **Server** | `layout.tsx`        | 全局结构                  |
| **Server** | `PostCard`（列表渲染）    | 纯展示，无交互               |
| **Client** | `AcademicParticles` | Canvas动画              |
| **Client** | `MottoStream`       | CSS动画，需hydrate        |
| **Client** | `LikeButton`        | 需要useState            |
| **Client** | `FeedLoader`        | IntersectionObserver  |
| **Client** | `ThemeToggle`       | localStorage          |
| **Client** | `MobileNav`         | 状态管理                  |
| **Client** | `CountUp`           | requestAnimationFrame |
| **Client** | `MagneticHover`     | onMouseMove           |

***

## 四、样式架构

### 4.1 Tailwind v4 配置

```css
/* globals.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

/* 自定义字体变量 */
@theme inline {
  --font-serif: var(--font-noto-serif-sc), 'Songti SC', serif;
  --font-sans: var(--font-noto-sans-sc), 'PingFang SC', sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;
  
  /* 学院靛蓝 */
  --color-indigo-50: #eef2ff;
  --color-indigo-100: #e0e7ff;
  --color-indigo-200: #c7d2fe;
  --color-indigo-600: #4f46e5;
  --color-indigo-700: #4338ca;
  --color-indigo-800: #312e81;
  --color-indigo-900: #1e1b4b;
  --color-indigo-950: #0f172a;
  
  /* 典雅暖金 */
  --color-gold-50: #fdf8e8;
  --color-gold-100: #f9edc0;
  --color-gold-200: #f0d878;
  --color-gold-300: #e6c65c;
  --color-gold-400: #d4af37;
  --color-gold-500: #b8941f;
  
  /* 学术灰已在 Tailwind 默认中 */
}
```

### 4.2 暗色模式实现

保留现有方案：

* `html` 标签添加 `.dark` 或 `.light` 类

* `localStorage` 持久化主题偏好

* Head 内联 script 防止闪烁（已存在）

### 4.3 自定义工具类

```css
/* 在 globals.css 中 */
@utility text-balance {
  text-wrap: balance;
}

@utility font-serif {
  font-family: var(--font-serif);
}

@utility font-sans {
  font-family: var(--font-sans);
}

@utility font-mono {
  font-family: var(--font-mono);
}

/* 动效缓动 */
@utility ease-out-expo {
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

@utility ease-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 金色文字渐变 */
@utility text-gold-gradient {
  background: linear-gradient(135deg, #e6c65c, #d4af37, #b8941f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

***

## 五、动效实现方案

### 5.1 学院粒子场（AcademicParticles）

```typescript
// 技术要点
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  color: string; // 金色或白色
}

// Canvas 2D 渲染
// - 粒子数：桌面 40，移动 20
// - 连线：距离 < 120px 时绘制，opacity 0.06
// - 颜色：金色 #d4af37 + 白色 rgba(255,255,255,0.3)
// - 性能：requestAnimationFrame + 节流
```

### 5.2 校训文字流（MottoStream）

```typescript
// 纯 CSS 实现
// @keyframes motto-glow {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }
// 
// 文字使用 background-clip: text
// 背景为金色渐变动画
// 逐字显现使用 staggered animation-delay
```

### 5.3 滚动揭示（ScrollReveal）

```typescript
// 使用 IntersectionObserver
// 触发阈值：0.15
// 动画：opacity 0→1, translateY 30px→0, filter blur(4px)→blur(0)
// 时长：0.6s, ease-out-expo
// 支持 delay 属性实现错开
```

### 5.4 数字滚动（CountUp）

```typescript
// useCountUp hook
// 使用 requestAnimationFrame
// 缓动函数：easeOutExpo
// 时长：2000ms
// 格式化：Intl.NumberFormat
// 完成后 scale 1.05 → 1.0 回弹
```

### 5.5 卡片光泽（CardShine）

```typescript
// HOC / Wrapper component
// 伪元素 ::after
// 默认 translateX(-100%)
// hover 时 translateX(200%)，0.6s
// skewX(-15deg) 制造斜切感
// 背景：linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)
```

***

## 六、状态管理

### 6.1 全局状态（极少）

| 状态      | 方案                           | 说明   |
| ------- | ---------------------------- | ---- |
| 主题      | React Context + localStorage | 保留现有 |
| Session | NextAuth.js SessionProvider  | 保留现有 |

### 6.2 本地状态

* 表单状态：React Hook Form

* UI状态：useState（折叠、弹窗、标签页）

* 收藏数据：localStorage（帖子ID数组）

### 6.3 数据获取

```typescript
// Server Actions（保留现有）
// - createPost, createComment, toggleLike, etc.
// 
// 页面级数据获取（Server Component）
// - const session = await auth()
// - const posts = await prisma.post.findMany({...})
```

***

## 七、新增功能技术方案

### 7.1 分享功能

```typescript
// components/post/share-button.tsx
"use client"

export function ShareButton({ postId }: { postId: string }) {
  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`
    await navigator.clipboard.writeText(url)
    // Toast 提示
  }
  // ...
}
```

### 7.2 帖子收藏（localStorage）

```typescript
// hooks/use-favorites.ts
export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", [])
  
  const toggle = (postId: string) => {
    setFavorites(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }
  
  return { favorites, toggle, isFavorited: (id: string) => favorites.includes(id) }
}
```

### 7.3 热门标签云

```typescript
// 前端简单分词统计
// 从帖子标题提取 2-4 字词组
// 过滤停用词（的、了、是等）
// 按频率排序，取前 20
// 渲染为不同字号（频率越高字号越大）
```

***

## 八、性能优化策略

### 8.1 字体加载

```tsx
// layout.tsx
import { Noto_Serif_SC, Noto_Sans_SC, JetBrains_Mono } from 'next/font/google'

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
})

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
})
```

### 8.2 图片优化

* 所有图片使用 Next.js `<Image>` 组件

* 配置 `remotePatterns` 保留 GitHub 头像

* 校园图片使用 `priority` + `placeholder="blur"`

### 8.3 动效性能

* 粒子效果使用 `will-change: transform` 谨慎

* 滚动监听使用 IntersectionObserver（非 scroll 事件）

* 复杂动画使用 `transform` 和 `opacity`（GPU加速）

* 移动端减少粒子数、禁用部分动效

### 8.4 代码分割

* 动效组件使用动态导入 `next/dynamic`

* 管理员页面独立 chunk

* 富文本编辑器懒加载

***

## 九、开发顺序

### Phase 1: 基础架构（1-2天）

1. 更新 `globals.css` — 新色彩系统、字体变量、工具类
2. 更新 `layout.tsx` — 加载新字体、全局结构
3. 创建 `hooks/` 目录 — 通用 hooks
4. 重构 `ui/` 基础组件 — 新色彩规范

### Phase 2: 全局组件（2-3天）

1. 重构 `Header` — 校徽位置、导航、滚动行为
2. 重构 `Footer` — 校训展示、学校信息
3. 创建动效组件 — Particles, MottoStream, ScrollReveal, CountUp
4. 重构 `ThemeProvider` — 适配新色彩

### Phase 3: 核心页面（3-4天）

1. 重构 `首页` — Hero、校训条、版块网格、校园风采、CTA
2. 重构 `登录/注册页` — 左右分栏、粒子背景
3. 重构 `帖子详情页` — 新布局、分享功能、评论回复
4. 重构 `发帖页` — 步骤指示器、分类卡片选择

### Phase 4: 功能页面（2-3天）

1. 重构 `表白墙` — 玫瑰主题、粒子动效
2. 重构 `个人主页` — 封面图、统计、标签页、收藏
3. 重构 `管理员仪表盘` — 统计卡片、趋势图
4. 重构 `搜索页` — 新布局、高亮

### Phase 5: 优化与测试（1-2天）

1. 暗色模式全面检查
2. 移动端响应式测试
3. 动效性能优化
4. 功能回归测试

***

## 十、风险与应对

| 风险                   | 影响        | 应对                       |
| -------------------- | --------- | ------------------------ |
| Next.js 16.2.6 非标准版本 | 可能有未知bug  | 逐步重构，每步验证                |
| Tailwind v4 语法差异     | 样式不生效     | 严格遵循 `@theme inline` 语法  |
| 中文字体加载慢              | FOUT/FOIT | `display: 'swap'`，系统字体兜底 |
| 粒子动效性能差              | 卡顿        | 移动端降级，减少粒子数              |
| 暗色模式闪烁               | 用户体验差     | 保留现有 head script 方案      |

***

## 十一、关键代码约定

### 11.1 组件文件命名

* 页面组件：`page.tsx`

* 布局组件：`layout.tsx`

* 共享组件：`kebab-case.tsx`

* Hooks：`use-kebab-case.ts`

### 11.2 类型定义

```typescript
// 组件 Props 命名
interface PostCardProps {
  post: PostWithAuthor
  hideAuthor?: boolean
}

// 数据库类型从 Prisma 生成
import type { Post, User } from '@/generated/prisma/client'
```

### 11.3 样式约定

```tsx
// 优先使用 Tailwind 工具类
// 复杂样式使用 cn() 合并
import { cn } from '@/lib/utils'

className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)}
```

### 11.4 颜色使用规范

```tsx
// ✅ 正确：使用语义化颜色
className="bg-indigo-700 text-white hover:bg-indigo-800"
className="text-gold-400"

// ❌ 错误：硬编码颜色
className="bg-[#4338ca]"
```

