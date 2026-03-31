import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { ArrowLeft, Clock, MessageSquare, ArrowUp, ArrowDown, AlertCircle, Bookmark, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { Badge } from "@/components/ui/badge"
import { toggleVote } from "@/app/actions/discussion"
import { deleteOwnPost } from "@/app/actions/discussion"
import { redirect } from "next/navigation"
import { toggleBookmark } from "@/app/actions/bookmark"
import { CommentSection } from "./comment-section"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  try {
    const [post, session] = await Promise.all([
      prisma.post.findUnique({
        where: { id },
        include: {
          author: { select: { name: true } },
          subject: { select: { id: true, name: true, code: true } },
          votes: true,
          bookmarks: true,
          comments: {
            include: {
              author: { select: { name: true } },
              replies: {
                include: { author: { select: { name: true } } },
                orderBy: { createdAt: "asc" },
              },
            },
            where: { parentId: null },
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      auth(),
    ])

    if (!post) notFound()

    const voteScore = post.votes.reduce((acc, vote) => acc + vote.value, 0)
    const userVote = session?.user
      ? post.votes.find((v) => v.userId === session.user.id)?.value
      : 0
    const isBookmarked = session?.user
      ? post.bookmarks.some((b) => b.userId === session.user.id)
      : false
      
    const isAuthorOrAdmin = session?.user && (session.user.id === post.authorId || session.user.role === "ADMIN" || session.user.role === "MODERATOR")
    
    async function handleDeleteOwnPost() {
      "use server"
      if (!isAuthorOrAdmin) return
      await deleteOwnPost(post!.id)
      redirect('/posts')
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in duration-500 px-4">
        <Link href={`/subject/${post.subject.id}`} className={buttonVariants({ variant: "ghost", className: "mb-2" })}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to {post.subject.name}
        </Link>

        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-2 pt-2">
            <form action={async () => { "use server"; await toggleVote(post.id, 1) }}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className={`rounded-full h-10 w-10 ${userVote === 1 ? "text-orange-500 bg-orange-500/10" : ""}`}
              >
                <ArrowUp className="h-6 w-6" />
              </Button>
            </form>
            <span className="font-bold text-lg">{voteScore}</span>
            <form action={async () => { "use server"; await toggleVote(post.id, -1) }}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className={`rounded-full h-10 w-10 ${userVote === -1 ? "text-blue-500 bg-blue-500/10" : ""}`}
              >
                <ArrowDown className="h-6 w-6" />
              </Button>
            </form>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{post.subject.code}</Badge>
                <span>Posted by {post.author.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                {session?.user && (
                  <>
                    <span>•</span>
                    <form action={async () => { "use server"; await toggleBookmark(post.id) }}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ml-1 ${isBookmarked ? "text-blue-500" : ""}`}
                      >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                        <span className="sr-only">Bookmark</span>
                      </Button>
                    </form>
                    {isAuthorOrAdmin && (
                      <>
                        <span>•</span>
                        <form action={handleDeleteOwnPost}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete Post"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </form>
                      </>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold">{post.title}</h1>
              <div className="prose prose-neutral dark:prose-invert max-w-none break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground font-medium pt-4 border-t">
              <MessageSquare className="h-5 w-5" />
              <span>
                {post.comments.length + post.comments.reduce((acc, c) => acc + c.replies.length, 0)} Comments
              </span>
            </div>

            <CommentSection postId={post.id} comments={post.comments} session={session} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error(`Failed to fetch post ${id}:`, error)
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center text-center space-y-4 bg-destructive/10 rounded-3xl border border-destructive/20 animate-in fade-in">
        <AlertCircle className="h-12 w-12 text-destructive mb-2" />
        <h2 className="text-2xl font-bold text-destructive">Oops! Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          We encountered an error while loading the discussion. Please try refreshing the page.
        </p>
        <Link href="/posts" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
          Back to Discussions
        </Link>
      </div>
    )
  }
}
