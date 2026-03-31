import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button-variants"

export default async function UserModerationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    redirect("/")
  }

  const resolvedParams = await params
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { subject: true }
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { post: true }
      }
    }
  })

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Moderation</h1>
        <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
          Back to Admin
        </Link>
      </div>

      <Card className="mb-8">
        <CardContent className="flex items-center gap-6 pt-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{user.name || "Unknown"}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">@{user.username || "No username"}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant={user.role === "ADMIN" ? "destructive" : "default"}>{user.role}</Badge>
              <Badge variant="secondary">Karma: {user.karma}</Badge>
              <Badge variant="outline">Joined: {new Date(user.createdAt).toLocaleDateString()}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {user.posts.length === 0 ? (
              <p className="text-muted-foreground">No posts yet</p>
            ) : (
              <ul className="space-y-4">
                {user.posts.map(post => (
                  <li key={post.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <Link href={`/post/${post.id}`} className="font-medium hover:underline block mb-1">
                      {post.title}
                    </Link>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{post.subject.name}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {user.comments.length === 0 ? (
              <p className="text-muted-foreground">No comments yet</p>
            ) : (
              <ul className="space-y-4">
                {user.comments.map(comment => (
                  <li key={comment.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <p className="text-sm line-clamp-2 mb-2">{comment.content}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <Link href={`/post/${comment.postId}`} className="hover:underline">
                        View Post
                      </Link>
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
