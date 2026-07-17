"use client"

import { useActionState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createComment } from "@/lib/actions"
import { Loader2, Send } from "lucide-react"

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const boundCreateComment = createComment.bind(null, postId)
  const [state, formAction, isPending] = useActionState(boundCreateComment, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Textarea
          name="content"
          placeholder="写下你的评论..."
          rows={4}
          disabled={isPending}
          className="min-h-32 resize-none rounded-none border-2 border-[#191914] bg-white p-4 leading-7 text-[#191914] focus-visible:ring-[#ff6b43] focus-visible:ring-offset-0 dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
        />
        {state && "errors" in state && state.errors?.content && (
          <p className="mt-2 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">
            {state.errors.content[0]}
          </p>
        )}
      </div>
      {state && "message" in state && state.message && (
        <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{state.message}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} size="sm" className="h-10 rounded-none border-2 border-[#191914] bg-[#d9ef61] px-5 font-bold text-[#191914] shadow-[3px_3px_0_#191914] hover:bg-[#d9ef61] dark:border-[#f5f0e5] dark:bg-[#d9ef61] dark:text-[#191914] dark:shadow-[3px_3px_0_#f5f0e5]">
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />提交中...</> : <><Send className="mr-2 h-4 w-4" />发表评论</>}
        </Button>
      </div>
    </form>
  )
}
