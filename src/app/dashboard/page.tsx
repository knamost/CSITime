import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { MessageSquare, FileText, Bell, TrendingUp, Bookmark } from "lucide-react"
import { ResourceActions } from "@/components/resource-actions"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: {
        include: { subject: true, _count: { select: { comments: true, votes: true } } },
        orderBy: { createdAt: "desc" },
      },
      resources: {
        include: { subject: true },
        orderBy: { createdAt: "desc" },
      },
      bookmarks: {
        include: { 
          post: {
            include: { subject: true, _count: { select: { comments: true, votes: true } } }
          }
        },
        orderBy: { createdAt: "desc" },
      }
    },
  })

  if (!user) redirect("/login")

  // Simple notifications: comments on user's posts by other users
  const recentReplies = await prisma.comment.findMany({
    where: {
      post: { authorId: user.id },
      authorId: { not: user.id }
    },
    include: {
      author: { select: { name: true, image: true } },
      post: { select: { title: true, id: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  })

  const totalVotesReceived = user.posts.reduce((acc, p) => acc + p._count.votes, 0)
  const totalDownloads = user.resources.reduce((acc, r) => acc + r.downloads, 0)

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name || user.username}. Here's your activity overview.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">{user.karma} Karma</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.posts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Received {totalVotesReceived} total votes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resources Shared
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.resources.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Downloaded {totalDownloads} times</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.bookmarks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Bookmarks for quick access</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-fit">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="posts">Discussions</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>People interacting with your content</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReplies.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent notifications</p>
              ) : (
                <div className="space-y-4">
                  {recentReplies.map(reply => (
                    <div key={reply.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold">{reply.author.name}</span> replied to your post{" "}
                          <Link href={`/post/${reply.post.id}`} className="font-medium hover:underline text-primary">
                            "{reply.post.title}"
                          </Link>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              {user.posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">You haven't started any discussions yet.</p>
              ) : (
                <div className="space-y-3">
                  {user.posts.map(post => (
                    <div key={post.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg gap-4">
                      <div>
                        <Link href={`/post/${post.id}`} className="font-medium hover:underline text-lg">
                          {post.title}
                        </Link>
                        <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                          <span>in {post.subject.name}</span>
                          <span>• {post._count.comments} comments</span>
                          <span>• {post._count.votes} votes</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Uploaded Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {user.resources.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">You haven't shared any resources yet.</p>
              ) : (
                <div className="space-y-3">
                  {user.resources.map(resource => (
                    <div key={resource.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg gap-4">
                      <div>
                        <p className="font-medium text-lg">{resource.title}</p>
                        <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                          <span>in {resource.subject.name}</span>
                          <span>• {resource.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm bg-muted px-2 py-1 rounded font-medium">{resource.downloads} downloads</span>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </div>
                        <ResourceActions resource={{
                          id: resource.id,
                          title: resource.title,
                          type: resource.type,
                          year: resource.year
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              {user.bookmarks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No saved items.</p>
              ) : (
                <div className="space-y-3">
                  {user.bookmarks.map(bookmark => (
                    <div key={bookmark.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg gap-4">
                      <div>
                        <Link href={`/post/${bookmark.post.id}`} className="font-medium hover:underline text-lg">
                          {bookmark.post.title}
                        </Link>
                        <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                          <span>in {bookmark.post.subject.name}</span>
                          <span>• {bookmark.post._count.comments} comments</span>
                          <span>• {bookmark.post._count.votes} votes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
