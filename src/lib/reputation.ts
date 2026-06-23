/**
 * 校园论坛声望系统
 *
 * 设计理念：
 * - 游戏化等级体系，让用户有成长感
 * - 奖励优质内容和积极互动
 * - 管理员拥有专属特权标识，彰显权威
 *
 * 等级体系：
 *   Lv.1 萌新    (0-49)     灰色
 *   Lv.2 学徒    (50-149)   绿色
 *   Lv.3 活跃    (150-349)  蓝色
 *   Lv.4 贡献者  (350-699)  青色
 *   Lv.5 达人    (700-1399) 紫色
 *   Lv.6 大佬    (1400-2999)橙色
 *   Lv.7 传奇    (3000-5999)红色
 *   Lv.8 至尊    (6000+)    金色
 *   Lv.MAX 校园守护者 (管理员) 金色+皇冠
 */

// ===== 声望积分常量 =====
export const REP_POINTS = {
  POST_CREATED: 5,
  COMMENT_CREATED: 2,
  POST_LIKED: 3, // 帖子被点赞时，帖子作者获得的声望
  POST_PINNED: 20,
  DAILY_FIRST_POST: 3,
  POST_DELETED: -5,
  COMMENT_DELETED: -2,
  BANNED: -50,
  UNBANNED_RESTORE: 50,
} as const

// ===== 等级定义 =====
export interface LevelInfo {
  level: number
  title: string
  minRep: number
  maxRep: number | null // null 表示无上限
  color: string // tailwind text color class
  bgColor: string // tailwind bg color class
  borderColor: string
  gradient: string // tailwind gradient classes
  glow: string // shadow/glow effect
}

const LEVELS: LevelInfo[] = [
  {
    level: 1,
    title: "萌新",
    minRep: 0,
    maxRep: 49,
    color: "text-stone-500 dark:text-stone-400",
    bgColor: "bg-stone-100 dark:bg-stone-800",
    borderColor: "border-stone-300 dark:border-stone-700",
    gradient: "from-stone-400 to-stone-500",
    glow: "shadow-stone-500/20",
  },
  {
    level: 2,
    title: "学徒",
    minRep: 50,
    maxRep: 149,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-300 dark:border-emerald-800",
    gradient: "from-emerald-400 to-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  {
    level: 3,
    title: "活跃",
    minRep: 150,
    maxRep: 349,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    borderColor: "border-sky-300 dark:border-sky-800",
    gradient: "from-sky-400 to-sky-500",
    glow: "shadow-sky-500/20",
  },
  {
    level: 4,
    title: "贡献者",
    minRep: 350,
    maxRep: 699,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-300 dark:border-cyan-800",
    gradient: "from-cyan-400 to-cyan-500",
    glow: "shadow-cyan-500/20",
  },
  {
    level: 5,
    title: "达人",
    minRep: 700,
    maxRep: 1399,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-300 dark:border-violet-800",
    gradient: "from-violet-400 to-violet-500",
    glow: "shadow-violet-500/20",
  },
  {
    level: 6,
    title: "大佬",
    minRep: 1400,
    maxRep: 2999,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-300 dark:border-orange-800",
    gradient: "from-orange-400 to-orange-500",
    glow: "shadow-orange-500/20",
  },
  {
    level: 7,
    title: "传奇",
    minRep: 3000,
    maxRep: 5999,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-300 dark:border-rose-800",
    gradient: "from-rose-400 to-rose-500",
    glow: "shadow-rose-500/20",
  },
  {
    level: 8,
    title: "至尊",
    minRep: 6000,
    maxRep: null,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-300 dark:border-amber-800",
    gradient: "from-amber-400 to-yellow-500",
    glow: "shadow-amber-500/30",
  },
]

// 管理员专属等级
export const ADMIN_LEVEL: LevelInfo = {
  level: 999,
  title: "校园守护者",
  minRep: 9999,
  maxRep: null,
  color: "text-amber-600 dark:text-amber-400",
  bgColor: "bg-amber-50 dark:bg-amber-950/30",
  borderColor: "border-amber-400 dark:border-amber-600",
  gradient: "from-amber-400 via-yellow-400 to-amber-500",
  glow: "shadow-amber-500/40",
}

/**
 * 根据声望值和角色获取等级信息
 */
export function getLevelInfo(raputation: number, role?: string | null): LevelInfo {
  if (role === "ADMIN") {
    return ADMIN_LEVEL
  }

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (raputation >= LEVELS[i].minRep) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

/**
 * 获取到下一级的进度
 */
export function getLevelProgress(raputation: number, role?: string | null): {
  current: number
  next: number | null
  progress: number
  remaining: number
} {
  if (role === "ADMIN") {
    return { current: 9999, next: null, progress: 100, remaining: 0 }
  }

  const info = getLevelInfo(raputation, role)
  if (info.maxRep === null) {
    return { current: raputation, next: null, progress: 100, remaining: 0 }
  }

  const rangeSize = info.maxRep - info.minRep + 1
  const currentInLevel = raputation - info.minRep
  const progress = Math.min(100, Math.round((currentInLevel / rangeSize) * 100))
  const remaining = info.maxRep - raputation + 1

  return {
    current: raputation,
    next: info.maxRep + 1,
    progress,
    remaining,
  }
}

/**
 * 获取显示用的声望值（管理员固定显示 9999）
 */
export function getDisplayRaputation(raputation: number, role?: string | null): number {
  if (role === "ADMIN") return 9999
  return raputation
}

// ===== 成就徽章 =====
export interface BadgeInfo {
  id: string
  name: string
  description: string
  icon: string // lucide icon name
  color: string
  bgColor: string
  earned: boolean
}

export interface UserStatsForBadges {
  postCount: number
  commentCount: number
  likeReceivedCount: number
  hasPinnedPost?: boolean
  role?: string | null
}

/**
 * 根据用户统计数据计算已获得的徽章
 */
export function getUserBadges(stats: UserStatsForBadges): BadgeInfo[] {
  const isAdmin = stats.role === "ADMIN"

  const allBadges: BadgeInfo[] = [
    {
      id: "first-post",
      name: "初出茅庐",
      description: "发表第一篇帖子",
      icon: "PenSquare",
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-950/30",
      earned: stats.postCount >= 1,
    },
    {
      id: "chatterbox",
      name: "话唠",
      description: "发表 50 条以上评论",
      icon: "MessageSquare",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      earned: stats.commentCount >= 50,
    },
    {
      id: "popular",
      name: "人气王",
      description: "获得 100 个以上点赞",
      icon: "Heart",
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      earned: stats.likeReceivedCount >= 100,
    },
    {
      id: "prolific",
      name: "勤奋作者",
      description: "发表 20 篇以上帖子",
      icon: "BookOpen",
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-950/30",
      earned: stats.postCount >= 20,
    },
    {
      id: "social",
      name: "社交达人",
      description: "有 5 篇帖子各获得 5 条以上评论",
      icon: "Users",
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      earned: stats.postCount >= 5 && stats.commentCount >= 25,
    },
    {
      id: "pinned",
      name: "置顶达人",
      description: "帖子被管理员置顶",
      icon: "Pin",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      earned: !!stats.hasPinnedPost,
    },
    {
      id: "guardian",
      name: "校园守护者",
      description: "论坛管理员专属徽章",
      icon: "Shield",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
      earned: isAdmin,
    },
  ]

  return allBadges
}

/**
 * 获取已获得的徽章数量
 */
export function getEarnedBadgeCount(stats: UserStatsForBadges): number {
  return getUserBadges(stats).filter((b) => b.earned).length
}
