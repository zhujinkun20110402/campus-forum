/**
 * 投票帖数据解析（Post.poll 为 jsonb，存储结构见下）
 * 结构：{ options: [{ id: string, text: string }] }
 */

export const POLL_MIN_OPTIONS = 2
export const POLL_MAX_OPTIONS = 6
export const POLL_OPTION_MAX_LENGTH = 50

export interface PollOption {
  id: string
  text: string
}

export interface PollData {
  options: PollOption[]
}

/** 安全解析 poll 字段，结构不合法返回 null */
export function parsePoll(value: unknown): PollData | null {
  if (!value || typeof value !== "object") return null
  const raw = (value as { options?: unknown }).options
  if (!Array.isArray(raw)) return null

  const options: PollOption[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") return null
    const option = item as { id?: unknown; text?: unknown }
    if (typeof option.id !== "string" || typeof option.text !== "string") return null
    if (!option.id || !option.text.trim()) return null
    options.push({ id: option.id, text: option.text.trim() })
  }

  if (options.length < POLL_MIN_OPTIONS) return null
  return { options }
}

/** 由文本数组构建存储结构（id 依次为 o1、o2…） */
export function buildPoll(texts: string[]): PollData {
  return { options: texts.map((text, index) => ({ id: `o${index + 1}`, text: text.trim() })) }
}
