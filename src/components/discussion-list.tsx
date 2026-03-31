"use client"

import Link from "next/link"
import { MessageSquare, ArrowUp, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Post = {
  id: string
  title: string
  createdAt: Date
  author: { name: string }
  _count: { comments: number; votes: number }
}

export function DiscussionList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground">No discussions started yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link key={post.id} href={`/post/${post.id}`} className="block">
          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center min-w-[3rem] bg-muted/50 rounded-md p-2">
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">{post._count.votes}</span>
            </div>
            
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg line-clamp-1">{post.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground gap-3">
                <span>Posted by {post.author.name}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post._count.comments} comments
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
