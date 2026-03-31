import { prisma } from "@/lib/prisma"
import { DiscussionList } from "@/components/discussion-list"
import { MessageSquare, Plus } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export const revalidate = 0 // Discussions should be fresh

export default async function PostsPage() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return (
      <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
              <p className="text-muted-foreground">
                Join the conversation with other CSIT students.
              </p>
            </div>
          </div>
          <Link href="/post/new" className={buttonVariants()}>
            <Plus className="h-4 w-4 mr-2" /> Start Discussion
          </Link>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <DiscussionList posts={posts as any} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-destructive/10 rounded-3xl border border-destructive/20 max-w-5xl mx-auto mt-8">
        <h2 className="text-2xl font-bold text-destructive">Oops! Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          We encountered an error while loading the discussions. Please try refreshing the page.
        </p>
      </div>
    )
  }
}
