/**
 * 声望之路（Reputation Road）配置引擎
 *
 * 设计原则：
 * - 声望只涨不减，一切奖励按声望值派生，无领取记录表、无定时任务
 * - 固定节点：跨过门槛即解锁（功能 / 一次性卡片 / 邀请额度 / 称号 / 主题）
 * - 宝箱：确定性随机 —— hash(用户ID + 宝箱序号) 从奖池抽取，
 *   同一用户同一个箱子永远开出同一结果，不同用户结果不同
 * - 一次性卡库存 = 累计获得（固定节点 + 宝箱）− 已用计数
 * - 邀请码以「邀请额度」发放，用户主动铸造时才生成真实邀请码
 */

export type FeatureKey =
  | "postEdit" // 帖子编辑（发布后 30 分钟内）
  | "pollPost" // 投票帖
  | "anonymousPost" // 匿名卡发帖
  | "scheduledPost" // 定时发布
  | "topicChallenge" // 话题挑战发起资格
  | "honorWall" // 首页荣誉墙展示位

export type MilestoneKind = "feature" | "consumable" | "decorative" | "chest"

export interface MilestoneNode {
  rep: number
  id: string
  name: string
  description: string
  kind: MilestoneKind
  feature?: FeatureKey
  pinCards?: number
  anonCards?: number
  inviteQuota?: number
  titleId?: string
  themeId?: string
}

/** 帖子编辑窗口：30 分钟 */
export const EDIT_WINDOW_MS = 30 * 60 * 1000

/** 置顶卡置顶时长：24 小时 */
export const SELF_PIN_DURATION_MS = 24 * 60 * 60 * 1000

/** 自助置顶是否仍在有效期内 */
export function isSelfPinnedActive(selfPinnedAt: Date | string | null | undefined): boolean {
  if (!selfPinnedAt) return false
  const time = typeof selfPinnedAt === "string" ? new Date(selfPinnedAt).getTime() : selfPinnedAt.getTime()
  return Date.now() - time < SELF_PIN_DURATION_MS
}

// ===== 固定节点 =====
export const MILESTONES: MilestoneNode[] = [
  {
    rep: 150, id: "m150", kind: "feature", feature: "postEdit",
    name: "帖子编辑", description: "发布后 30 分钟内可修改自己的帖子",
  },
  {
    rep: 300, id: "m300", kind: "consumable", inviteQuota: 2,
    name: "邀请额度 +2", description: "可额外生成 2 枚邀请码",
  },
  {
    rep: 450, id: "c1", kind: "chest",
    name: "宝箱", description: "随机开出置顶卡或邀请额度",
  },
  {
    rep: 600, id: "m600", kind: "feature", themeId: "profileTheme",
    name: "主页自定义背景与主题", description: "3 款纸张主题 + 自选配色",
  },
  {
    rep: 800, id: "m800", kind: "consumable", pinCards: 2,
    name: "置顶卡 ×2", description: "自己的帖子置顶 24 小时",
  },
  {
    rep: 1000, id: "c2", kind: "chest",
    name: "宝箱", description: "随机开出置顶卡或邀请额度",
  },
  {
    rep: 1200, id: "m1200", kind: "decorative", titleId: "study-room-regular",
    name: "称号「自习室常客」", description: "可在设置中装备此称号",
  },
  {
    rep: 1400, id: "m1400", kind: "consumable", inviteQuota: 3,
    name: "邀请额度 +3", description: "可额外生成 3 枚邀请码",
  },
  {
    rep: 1600, id: "m1600", kind: "feature", feature: "pollPost",
    name: "投票帖", description: "发布带选项的投票帖，收集同学们的意见",
  },
  {
    rep: 1800, id: "c3", kind: "chest",
    name: "宝箱", description: "随机开出置顶卡或邀请额度",
  },
  {
    rep: 2000, id: "m2000", kind: "consumable", pinCards: 3,
    name: "置顶卡 ×3", description: "自己的帖子置顶 24 小时",
  },
  {
    rep: 2400, id: "m2400", kind: "decorative", titleId: "canteen-observer",
    name: "称号「食堂观察员」", description: "可在设置中装备此称号",
  },
  {
    rep: 2800, id: "m2800", kind: "consumable", inviteQuota: 4,
    name: "邀请额度 +4", description: "可额外生成 4 枚邀请码",
  },
  {
    rep: 3200, id: "c4", kind: "chest",
    name: "宝箱", description: "随机开出置顶卡或邀请额度",
  },
  {
    rep: 3600, id: "m3600", kind: "feature", feature: "anonymousPost", anonCards: 2,
    name: "匿名卡 ×2", description: "在任意分类匿名发帖（管理员仍可追溯）",
  },
  {
    rep: 4000, id: "m4000", kind: "consumable", inviteQuota: 5,
    name: "邀请额度 +5", description: "可额外生成 5 枚邀请码",
  },
  {
    rep: 4400, id: "m4400", kind: "feature", feature: "scheduledPost",
    name: "定时发布", description: "写好帖子，预约时间自动发出",
  },
  {
    rep: 4800, id: "c5", kind: "chest",
    name: "宝箱", description: "随机开出卡片或邀请额度",
  },
  {
    rep: 5200, id: "m5200", kind: "consumable", pinCards: 4,
    name: "置顶卡 ×4", description: "自己的帖子置顶 24 小时",
  },
  {
    rep: 5600, id: "m5600", kind: "decorative", titleId: "campus-vane",
    name: "称号「校园风向标」", description: "可在设置中装备此称号",
  },
  {
    rep: 6000, id: "m6000", kind: "consumable", inviteQuota: 8,
    name: "邀请额度 +8", description: "可额外生成 8 枚邀请码",
  },
  {
    rep: 6400, id: "c6", kind: "chest",
    name: "宝箱", description: "随机开出卡片或邀请额度",
  },
  {
    rep: 6800, id: "m6800", kind: "feature", feature: "topicChallenge",
    name: "话题挑战发起资格", description: "每月可发起一次校园话题挑战",
  },
  {
    rep: 7200, id: "m7200", kind: "consumable", pinCards: 3, anonCards: 3,
    name: "大礼包", description: "置顶卡 ×3 + 匿名卡 ×3",
  },
  {
    rep: 7600, id: "c7", kind: "chest",
    name: "宝箱", description: "随机开出卡片或邀请额度",
  },
  {
    rep: 8000, id: "m8000", kind: "decorative", titleId: "legend-resident",
    name: "称号「传奇常驻」", description: "可在设置中装备此称号",
  },
  {
    rep: 8400, id: "m8400", kind: "consumable", inviteQuota: 12,
    name: "邀请额度 +12", description: "可额外生成 12 枚邀请码",
  },
  {
    rep: 8800, id: "m8800", kind: "feature", feature: "honorWall",
    name: "首页荣誉墙展示位", description: "进入首页「传奇荣誉墙」（声望前 8 自动上榜）",
  },
  {
    rep: 9200, id: "c8", kind: "chest",
    name: "宝箱", description: "随机开出卡片或邀请额度",
  },
  {
    rep: 10000, id: "m10000", kind: "decorative", titleId: "living-fossil",
    name: "称号「活化石」", description: "可在设置中装备此称号",
  },
]

// ===== 宝箱 =====
export const CHEST_THRESHOLDS = [450, 1000, 1800, 3200, 4800, 6400, 7600, 9200]
export const CHEST_LOOP_START = 9200
export const CHEST_LOOP_STEP = 2000

export interface ChestReward {
  kind: "pinCards" | "anonCards" | "inviteQuota"
  quantity: number
  label: string
}

interface PoolEntry {
  reward: ChestReward
  weight: number
}

/** 低段池（宝箱 #1~#4）：只出置顶卡与邀请额度 */
const LOW_POOL: PoolEntry[] = [
  { reward: { kind: "pinCards", quantity: 1, label: "置顶卡 ×1" }, weight: 45 },
  { reward: { kind: "pinCards", quantity: 2, label: "置顶卡 ×2" }, weight: 20 },
  { reward: { kind: "inviteQuota", quantity: 2, label: "邀请额度 +2" }, weight: 20 },
  { reward: { kind: "inviteQuota", quantity: 3, label: "邀请额度 +3" }, weight: 10 },
  { reward: { kind: "inviteQuota", quantity: 5, label: "邀请额度 +5" }, weight: 5 },
]

/** 高段池（宝箱 #5 起，声望 ≥ 3600 后自然到达）：加入匿名卡 */
const HIGH_POOL: PoolEntry[] = [
  { reward: { kind: "pinCards", quantity: 1, label: "置顶卡 ×1" }, weight: 30 },
  { reward: { kind: "anonCards", quantity: 1, label: "匿名卡 ×1" }, weight: 30 },
  { reward: { kind: "pinCards", quantity: 2, label: "置顶卡 ×2" }, weight: 12 },
  { reward: { kind: "anonCards", quantity: 2, label: "匿名卡 ×2" }, weight: 12 },
  { reward: { kind: "inviteQuota", quantity: 2, label: "邀请额度 +2" }, weight: 10 },
  { reward: { kind: "inviteQuota", quantity: 3, label: "邀请额度 +3" }, weight: 4 },
  { reward: { kind: "inviteQuota", quantity: 5, label: "邀请额度 +5" }, weight: 2 },
]

/** FNV-1a 字符串哈希：确定性随机种子 */
function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** 已到达的宝箱数量（9200 后每 2000 声望循环 +1） */
export function getChestCount(rep: number): number {
  if (rep < CHEST_THRESHOLDS[0]) return 0
  for (let i = 0; i < CHEST_THRESHOLDS.length; i++) {
    if (rep < CHEST_THRESHOLDS[i]) return i
  }
  return CHEST_THRESHOLDS.length + Math.floor((rep - CHEST_LOOP_START) / CHEST_LOOP_STEP)
}

/** 摇宝箱 #index（1 起）：同用户同序号永远同结果 */
export function rollChest(userId: string, chestIndex: number): ChestReward {
  const pool = chestIndex <= 4 ? LOW_POOL : HIGH_POOL
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0)
  const roll = hashString(`${userId}:chest:${chestIndex}`) % total

  let acc = 0
  for (const entry of pool) {
    acc += entry.weight
    if (roll < acc) return entry.reward
  }
  return pool[0].reward
}

/** 第 index 个宝箱对应的声望门槛（用于展示"下一个宝箱还差多少"） */
export function getChestThreshold(index: number): number {
  // index 从 1 开始
  if (index <= CHEST_THRESHOLDS.length) return CHEST_THRESHOLDS[index - 1]
  return CHEST_LOOP_START + (index - CHEST_THRESHOLDS.length) * CHEST_LOOP_STEP
}

// ===== 称号 =====
export interface TitleInfo {
  id: string
  name: string
  rep: number
  description: string
}

export const TITLES: TitleInfo[] = [
  { id: "study-room-regular", name: "自习室常客", rep: 1200, description: "图书馆的灯为你而亮" },
  { id: "canteen-observer", name: "食堂观察员", rep: 2400, description: "对每一道菜都有发言权" },
  { id: "campus-vane", name: "校园风向标", rep: 5600, description: "你往哪儿吹，全校就往哪儿看" },
  { id: "legend-resident", name: "传奇常驻", rep: 8000, description: "论坛的活历史" },
  { id: "living-fossil", name: "活化石", rep: 10000, description: "比校史还长" },
]

export function getUnlockedTitles(rep: number): TitleInfo[] {
  return TITLES.filter((title) => rep >= title.rep)
}

export function isTitleUnlocked(rep: number, titleId: string): boolean {
  return TITLES.some((title) => title.id === titleId && rep >= title.rep)
}

// ===== 主页主题 =====
export interface ProfileThemeInfo {
  id: string
  name: string
  description: string
}

export const PROFILE_THEMES: ProfileThemeInfo[] = [
  { id: "paper", name: "原浆纸", description: "经典米白纸面" },
  { id: "cream", name: "奶油布丁", description: "暖黄奶油色调" },
  { id: "ink", name: "夜墨", description: "深墨夜色调" },
]

export const PROFILE_THEME_REP = 600

export function isThemeUnlocked(rep: number): boolean {
  return rep >= PROFILE_THEME_REP
}

// ===== 派生计算 =====
export interface GrantedTotals {
  pinCards: number
  anonCards: number
  inviteQuota: number
}

/** 累计获得（固定节点 + 已到达的宝箱），按用户 ID 确定性计算 */
export function getGrantedTotals(rep: number, userId: string): GrantedTotals {
  let pinCards = 0
  let anonCards = 0
  let inviteQuota = 0

  for (const milestone of MILESTONES) {
    if (rep < milestone.rep) continue
    pinCards += milestone.pinCards ?? 0
    anonCards += milestone.anonCards ?? 0
    inviteQuota += milestone.inviteQuota ?? 0
  }

  const chestCount = getChestCount(rep)
  for (let i = 1; i <= chestCount; i++) {
    const reward = rollChest(userId, i)
    if (reward.kind === "pinCards") pinCards += reward.quantity
    if (reward.kind === "anonCards") anonCards += reward.quantity
    if (reward.kind === "inviteQuota") inviteQuota += reward.quantity
  }

  return { pinCards, anonCards, inviteQuota }
}

export interface Balances {
  pinCards: number
  anonCards: number
  inviteQuota: number
}

/** 当前可用余额 = 累计获得 − 已用 */
export function getBalances(rep: number, userId: string, used: GrantedTotals): Balances {
  const granted = getGrantedTotals(rep, userId)
  return {
    pinCards: Math.max(0, granted.pinCards - used.pinCards),
    anonCards: Math.max(0, granted.anonCards - used.anonCards),
    inviteQuota: Math.max(0, granted.inviteQuota - used.inviteQuota),
  }
}

/** 已解锁的功能集合 */
export function getUnlockedFeatures(rep: number, userId: string, used: GrantedTotals): Set<FeatureKey> {
  const features = new Set<FeatureKey>()
  for (const milestone of MILESTONES) {
    if (rep >= milestone.rep && milestone.feature) {
      features.add(milestone.feature)
    }
  }
  // 匿名卡为消耗品：有卡才能发匿名帖
  const balances = getBalances(rep, userId, used)
  if (balances.anonCards <= 0) features.delete("anonymousPost")
  return features
}

/** 某节点是否已达成 */
export function isMilestoneReached(rep: number, milestone: MilestoneNode): boolean {
  return rep >= milestone.rep
}

/** 距某节点还差多少声望 */
export function distanceToMilestone(rep: number, milestone: MilestoneNode): number {
  return Math.max(0, milestone.rep - rep)
}
