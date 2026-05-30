"use client"

import Link from "next/link"
import { MessageCircle, Heart } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatRelativeTime } from "@/lib/utils"

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    author: {
      name: string | null
      image: string | null
    }
    category: {
      name: string
      slug: string
    }
    _count: {
      comments: number
      likes: number
    }
    createdAt: Date | string
  }
}

export function PostCard({ post }: PostCardProps) {
  const truncatedContent =
    post.content.length > 200 ? post.content.slice(0, 200) + "..." : post.content

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Link
              href={`/category/${post.category.slug}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Badge variant="secondary">{post.category.name}</Badge>
            </Link>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
          <CardTitle className="text-lg">{post.title}</CardTitle>
          <CardDescription>{truncatedContent}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.image ?? undefined} />
              <AvatarFallback>
                {post.author.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              {post.author.name ?? "匿名用户"}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post._count.comments}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {post._count.likes}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}