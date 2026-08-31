/**
 * LaTeX 分隔符预处理（在 Markdown 解析之前对原文做替换）
 *
 * 为什么不在 remark 插件里做：
 * Markdown 把 \[ 当作转义符，解析后的文本节点里只剩 [，
 * 到插件阶段已经无法识别原始反斜杠了。
 *
 * 支持：
 * - \[ ... \]（可多行）→ $$ ... $$（独立公式）
 * - \( ... \)（可多行）→ $ ... $（行内公式）
 *
 * 围栏代码块（``` 包裹）内的内容不处理。
 */
export function preprocessLatex(markdown: string): string {
  const lines = markdown.split("\n")
  const output: string[] = []
  let buffer: string[] = []
  let inFence = false

  const flush = () => {
    if (buffer.length === 0) return
    const text = buffer.join("\n")
    output.push(
      text
        .replace(/\\\[([\s\S]+?)\\\]/g, (_match, inner: string) => `$$\n${inner}\n$$`)
        .replace(/\\\(([\s\S]+?)\\\)/g, (_match, inner: string) => `$${inner}$`)
    )
    buffer = []
  }

  for (const line of lines) {
    const trimmed = line.trimStart()
    if (trimmed.startsWith("```")) {
      if (!inFence) flush()
      inFence = !inFence
      output.push(line)
    } else if (inFence) {
      output.push(line)
    } else {
      buffer.push(line)
    }
  }
  flush()

  return output.join("\n")
}
