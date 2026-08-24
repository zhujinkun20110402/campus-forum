"use client"

import { useEffect, useState } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"

/**
 * 帖子正文渲染：
 * - 服务端只输出纯文本（节省 Worker 体积——marked/DOMPurify 只在浏览器里跑）
 * - 客户端挂载后渲染 Markdown 并用 DOMPurify 消毒，防止 XSS
 * - 渲染完成前显示纯文本（whitespace 保留），避免闪烁错位
 */
export function MarkdownContent({ content }: { content: string }) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = marked.parse(content, { gfm: true, breaks: true }) as string
      setHtml(DOMPurify.sanitize(raw))
    } catch {
      setHtml(null)
    }
  }, [content])

  if (html === null) {
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
