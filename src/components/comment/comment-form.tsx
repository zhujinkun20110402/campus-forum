"use client"

import { useActionState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createComment } from "@/lib/actions"

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const boundCreateComment = createComment.bind(null, postId)
  const [state, formAction, isPending] = useActionState(boundCreateComment, null)

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Textarea
          name="content"
          placeholder="写下你的评论..."
          rows={4}
          disabled={isPending}
          className="resize-none"
        />
        {state && "errors" in state && state.errors?.content && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.content[0]}
          </p>
        )}
      </div>
      {state && "message" in state && state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "提交中..." : "发表评论"}
        </Button>
      </div>
    </form>
  )
}