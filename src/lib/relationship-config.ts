/**
 * 关系系统共享配置（服务端与客户端通用，不含 Prisma 依赖）。
 */

export interface RelationshipTypeConfig {
  code: string
  name: string
  emoji: string
  english: string
  desc: string
  /** 卡片/徽章底色（Tailwind 类，取自全站校刊色盘） */
  surface: string
  /** 级别 1 与级别 10 的专属称呼 */
  level1Name: string
  level10Name: string
}

export const RELATIONSHIP_TYPES: Record<string, RelationshipTypeConfig> = {
  couple: {
    code: "couple",
    name: "情侣",
    emoji: "💘",
    english: "COUPLE",
    desc: "官方认证的校园情侣档",
    surface: "bg-[#ffb4aa]",
    level1Name: "心动",
    level10Name: "天生一对",
  },
  brothers: {
    code: "brothers",
    name: "兄弟",
    emoji: "🤝",
    english: "BROS",
    desc: "一起扛事一起闹",
    surface: "bg-[#b9ddbd]",
    level1Name: "点头之交",
    level10Name: "拜把兄弟",
  },
  sisters: {
    code: "sisters",
    name: "姐妹",
    emoji: "🌸",
    english: "SIS",
    desc: "无话不谈的小姐妹",
    surface: "bg-[#c8d7ef]",
    level1Name: "点头之交",
    level10Name: "亲如姐妹",
  },
  besties: {
    code: "besties",
    name: "闺蜜",
    emoji: "💅",
    english: "BFF",
    desc: "分享所有秘密的人",
    surface: "bg-[#f3c84b]",
    level1Name: "一见如故",
    level10Name: "灵魂闺蜜",
  },
  mentor: {
    code: "mentor",
    name: "师徒",
    emoji: "🎓",
    english: "MENTOR",
    desc: "一个愿意教，一个认真学",
    surface: "bg-[#d9ef61]",
    level1Name: "初入门墙",
    level10Name: "衣钵相传",
  },
  mates: {
    code: "mates",
    name: "搭子",
    emoji: "🍚",
    english: "MATES",
    desc: "饭搭子、学习搭子、快乐搭子",
    surface: "bg-[#f2eadc]",
    level1Name: "临时搭伙",
    level10Name: "天选搭子",
  },
  frenemies: {
    code: "frenemies",
    name: "损友",
    emoji: "😈",
    english: "FRENEMY",
    desc: "互相伤害，从不记仇",
    surface: "bg-[#ff6b43]",
    level1Name: "互相看不顺眼",
    level10Name: "相爱相杀",
  },
  squad: {
    code: "squad",
    name: "战友",
    emoji: "🎮",
    english: "SQUAD",
    desc: "开黑、比赛、并肩作战",
    surface: "bg-[#f2d0b2]",
    level1Name: "野排队友",
    level10Name: "生死与共",
  },
}

export const RELATIONSHIP_TYPE_CODES = Object.keys(RELATIONSHIP_TYPES) as string[]

export function getRelationshipType(code: string): RelationshipTypeConfig | undefined {
  return RELATIONSHIP_TYPES[code]
}

/** 等级经验门槛（1 级 = 0 XP 起） */
export const LEVEL_THRESHOLDS = [0, 40, 100, 200, 340, 520, 760, 1060, 1440, 2000] as const
export const MAX_LEVEL = LEVEL_THRESHOLDS.length
export const MAX_XP = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]

/** 通用等级称呼（按等级 1-10），情侣等类型会覆盖第 1 与第 10 级 */
const GENERIC_LEVEL_NAMES = ["初识", "投缘", "熟悉", "默契", "信任", "深厚", "知心", "传奇", "刻骨", "至交"]

export function getLevel(xp: number): number {
  let level = 1
  for (let index = LEVEL_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    if (xp >= LEVEL_THRESHOLDS[index]) {
      level = index + 1
      break
    }
  }
  return level
}

export function getLevelTitle(typeCode: string, level: number): string {
  const config = getRelationshipType(typeCode)
  if (level <= 1 && config) return config.level1Name
  if (level >= MAX_LEVEL && config) return config.level10Name
  return GENERIC_LEVEL_NAMES[Math.min(Math.max(level, 1), MAX_LEVEL) - 1] ?? "初识"
}

export interface LevelProgress {
  level: number
  title: string
  /** 当前等级内的经验值 */
  current: number
  /** 升到下一级还需要的经验值（满级为 0） */
  need: number
  /** 0-100 的等级内进度 */
  percent: number
  isMax: boolean
}

export function getLevelProgress(typeCode: string, xp: number): LevelProgress {
  const level = getLevel(xp)
  const isMax = level >= MAX_LEVEL
  const base = LEVEL_THRESHOLDS[level - 1]
  const next = isMax ? MAX_XP : LEVEL_THRESHOLDS[level]
  const current = Math.max(0, Math.min(xp, MAX_XP) - base)
  const span = Math.max(1, next - base)
  return {
    level,
    title: getLevelTitle(typeCode, level),
    current,
    need: isMax ? 0 : Math.max(0, next - Math.min(xp, MAX_XP)),
    percent: isMax ? 100 : Math.min(100, Math.round((current / span) * 100)),
    isMax,
  }
}

/** 每位成员同时可绑定的关系数量上限 */
export const MAX_ACTIVE_RELATIONSHIPS = 6

/** 每段关系每天的互动经验上限 */
export const DAILY_XP_CAP = 30

export const XP_VALUES = {
  LIKE: 3,
  COMMENT: 8,
  POSTCARD: 6,
} as const

export type XpAction = keyof typeof XP_VALUES
