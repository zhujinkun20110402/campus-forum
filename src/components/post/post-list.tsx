import { PostCard } from "@/components/post/post-card"

interface PostListProps {
  posts: {
    id: string
    title: string
    content: string
    author: {
      id: string
      name: string | null
      image: string | null
      role?: string | null
      raputation?: number | null
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
  }[]
  hideAuthor?: boolean
}

export function PostList({ posts, hideAuthor = false }: PostListProps) {
  return (
    <div className="grid gap-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} hideAuthor={hideAuthor} />
      ))}
    </div>
  )
}
