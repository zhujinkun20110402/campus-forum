/**
 * LaTeX 分隔符预处理（在 Markdown 解析之前对原文做替换）
 *
 * 为什么不在 remark 插件里做：
 * Markdown 把 \[ 当作转义符，解析后的文本节点里只剩 [，
 * 到插件阶段已经无法识别原始反斜杠了。
 *
 * 支持的写法（按处理顺序）：
 * 1. 裸公式行：整行以 LaTeX 命令开头且不含中文 → 自动包成 $$ 独立公式
 *    （直接把 \left[...\right]... 粘进正文也能渲染）
 * 2. \[ ... \]（可多行）→ $$ ... $$
 * 3. \( ... \)（可多行）→ $ ... $
 * 4. \begin{env}...\end{env}（equation/aligned/cases 等）→ $$ 包裹
 * 5. 单行 $$...$$ → 补换行成标准块级写法
 *
 * 围栏代码块（``` 包裹）内的内容不处理。
 */

const BARE_MATH_START =
  /^(\\left|\\right|\\frac|\\dfrac|\\tfrac|\\sum|\\prod|\\int|\\oint|\\iint|\\sqrt|\\lim|\\exp|\\ln|\\log|\\sin|\\cos|\\tan|\\arcsin|\\arccos|\\arctan|\\Gamma|\\zeta|\\pi|\\theta|\\infty|\\partial|\\nabla|\\text|\\overline|\\underline|\\boxed|\\displaystyle)/

/** 整行是否像一段"裸 LaTeX 公式"（用户直接粘贴、未加任何分隔符） */
function looksLikeBareMath(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed.startsWith("\\")) return false
  // 含中文的行可能是普通文本转义，跳过
  if (/[\u4e00-\u9fa5]/.test(trimmed)) return false
  return BARE_MATH_START.test(trimmed)
}

export function preprocessLatex(markdown: string): string {
  const lines = markdown.split("\n")
  const output: string[] = []
  let buffer: string[] = []
  let inFence = false

  const flush = () => {
    if (buffer.length === 0) return
    let text = buffer.join("\n")

    // 1. equation/aligned 等环境（最先处理，避免被后续规则拆散）
    text = text.replace(
      /\\begin\{([A-Za-z*]+)\}([\s\S]*?)\\end\{\1\}/g,
      (_match, env: string, inner: string) => `\n$$\n\\begin{${env}}${inner}\\end{${env}}\n$$\n`
    )

    // 2. LaTeX 惯用分隔符
    text = text
      .replace(/\\\[([\s\S]+?)\\\]/g, (_match, inner: string) => `$$\n${inner}\n$$`)
      .replace(/\\\(([\s\S]+?)\\\)/g, (_match, inner: string) => `$${inner}$`)

    // 3. 单行 $$...$$ 补换行（remark-math 要求 $$ 后跟空白）
    text = text.replace(/\$\$([^\n$]+?)\$\$/g, (_match, inner: string) => `\n$$\n${inner.trim()}\n$$\n`)

    // 4. 裸公式行：仅处理前几步剩下的行；$$ 块内部的行不再重复包裹
    const lines = text.split("\n")
    let inMathBlock = false
    const wrapped = lines.map((line) => {
      if (line.trim() === "$$") {
        inMathBlock = !inMathBlock
        return line
      }
      if (inMathBlock) return line
      return looksLikeBareMath(line) ? `$$\n${line}\n$$` : line
    })

    output.push(wrapped.join("\n"))
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
