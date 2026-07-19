"use client"

import { useActionState, useEffect, useRef } from "react"
import { Loader2, Send, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { createComment } from "@/lib/actions"

interface ReplyTarget {
  id: string
  name: string
  content: string
}

interface CommentFormProps {
  postId: string
  replyTo?: ReplyTarget | null
  onCancelReply?: () => void
  onSuccess?: () => void
}

export function CommentForm({ postId, replyTo, onCancelReply, onSuccess }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const boundCreateComment = createComment.bind(null, postId)
  const [state, formAction, isPending] = useActionState(boundCreateComment, null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      onSuccess?.()
    }
  }, [state, onSuccess])

  return (
    <form ref={formRef} action={formAction} className="border-t-2 border-[#191914] bg-[#fffaf0] p-3 dark:border-[#f5f0e5] dark:bg-[#191914] sm:p-4">
      <input type="hidden" name="parentId" value={replyTo?.id ?? ""} />

      {replyTo && (
        <div className="mb-3 flex items-start justify-between gap-3 border-l-4 border-[#e4532f] bg-[#ece6da] px-3 py-2 dark:bg-[#292821]">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#d44120] dark:text-[#ff8a68]">回复 @{replyTo.name}</p>
            <p className="mt-1 truncate text-xs text-[#777268] dark:text-[#aaa69c]">{replyTo.content}</p>
          </div>
          <button type="button" onClick={onCancelReply} className="flex h-7 w-7 shrink-0 items-center justify-center border border-transparent hover:border-[#191914] dark:hover:border-[#f5f0e5]" aria-label="取消回复">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 sm:gap-3">
        <Textarea
          id="comment-composer"
          name="content"
          placeholder={replyTo ? `回复 ${replyTo.name}...` : "发一条消息，加入讨论..."}
          rows={2}
          required
          disabled={isPending}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          className="min-h-12 flex-1 resize-none rounded-none border-2 border-[#191914] bg-white px-3 py-3 text-sm leading-6 text-[#191914] focus-visible:ring-[#ff6b43] focus-visible:ring-offset-0 dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5] sm:min-h-14"
        />
        <button type="submit" disabled={isPending} className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#191914] bg-[#d9ef61] text-[#191914] shadow-[3px_3px_0_#191914] disabled:opacity-60 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5] sm:h-14 sm:w-14" aria-label={replyTo ? "发送回复" : "发送评论"}>
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>

      {state && "errors" in state && state.errors?.content && (
        <p className="mt-2 text-xs font-bold text-[#b52f1e]" role="alert">{state.errors.content[0]}</p>
      )}
      {state && "message" in state && state.message && (
        <p className="mt-2 text-xs font-bold text-[#b52f1e]" role="alert">{state.message}</p>
      )}
      <p className="mt-2 hidden font-mono text-[8px] tracking-[0.1em] text-[#918b80] sm:block">CTRL / CMD + ENTER TO SEND</p>
    </form>
  )
}
