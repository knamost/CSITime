const fs = require('fs');

const content = `import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { deleteOwnPost, deleteOwnResource } from "@/app/actions/discussion"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: {
        include: { subject: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      resources: {
        include: { subject: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      bookmarks: {
        include: { 
          post: {
            include: { subject: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }
    },
  })

  if (!user) {
    redirect("/login")
  }

  const isAdminOrModerator = user.role === "ADMIN" || user.role === "MODERATOR"

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      
      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <ProfileForm user={user} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="font-medium capitalize">{user.role.toLowerCase()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Karma</Label>
                <p className="font-medium text-2xl text-primary">{user.karma}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Joined</Label>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              
              {isAdminOrModerator && (
                <div className="pt-4 border-t">
                  <Link href="/admin">
                    <Button className="w-full">
                      Enter Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">My Posts ({user.posts.length})</TabsTrigger>
            <TabsTrigger value="resources">My Resources ({user.resources.length})</TabsTrigger>
            <TabsTrigger value="bookmarks">Saved ({user.bookmarks.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-4">
            {user.posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No posts yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {user.posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4 flex justify-between items-start">
                      <div>
                        <Link href={\`/post/\${post.id}\`} className="font-medium hover:underline">
                          {post.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          in {post.subject.name} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <form action={async () => { "use server"; await deleteOwnPost(post.id); }}>
                        <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resources" className="mt-4">
            {user.resources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No resources uploaded yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {user.resources.map((resource) => (
                  <Card key={resource.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {resource.subject.name} • {resource.type} • {new Date(resource.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-muted px-2 py-1 rounded">{resource.downloads} downloads</span>
                          <form action={async () => { "use server"; await deleteOwnResource(resource.id); }}>
                            <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-4">
            {user.bookmarks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No saved posts yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {user.bookmarks.map((bookmark) => (
                  <Card key={bookmark.id}>
                    <CardContent className="p-4">
                      <Link href={\`/post/\${bookmark.post.id}\`} className="font-medium hover:underline">
                        {bookmark.post.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        in {bookmark.post.subject.name} • Saved on {new Date(bookmark.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
`
fs.writeFileSync('src/app/profile/page.tsx', content);
console.log("Profile page updated to use ProfileForm");
