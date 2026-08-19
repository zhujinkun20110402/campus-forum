import { PostRow } from "@/components/post/post-row"

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
    <div className="overflow-hidden border-2 border-[#191914] bg-[#fffaf0] shadow-[5px_5px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_rgba(245,240,229,0.12)]">
      {posts.map((post) => (
        <PostRow key={post.id} post={post} hideAuthor={hideAuthor} />
      ))}
    </div>
  )
}
