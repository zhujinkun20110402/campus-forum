import { PostCard } from "@/components/post/post-card"

interface PostListProps {
  posts: {
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
  }[]
  hideAuthor?: boolean
}

export function PostList({ posts, hideAuthor = false }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} hideAuthor={hideAuthor} />
      ))}
    </div>
  )
}