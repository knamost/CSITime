import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllUsers, getAllPosts, getAllResources, updateUserRole, deletePost, deleteResource } from "@/app/actions/admin"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    redirect("/")
  }

  const [usersResult, postsResult, resourcesResult] = await Promise.all([
    getAllUsers(),
    getAllPosts(),
    getAllResources(),
  ])

  const users = "users" in usersResult ? usersResult.users! : []
  const posts = "posts" in postsResult ? postsResult.posts! : []
  const resources = "resources" in resourcesResult ? resourcesResult.resources! : []

  async function handleRoleUpdate(userId: string, formData: FormData) {
    "use server"
    const role = formData.get("role") as string
    await updateUserRole(userId, role)
  }

  
  
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Karma</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === "ADMIN" ? "bg-red-100 text-red-700" :
                          user.role === "MODERATOR" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{user.karma}</TableCell>
                      <TableCell>{user._count.posts}</TableCell>
                      <TableCell>{user._count.resources}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.role !== "ADMIN" && (
                          <form action={handleRoleUpdate.bind(null, user.id)}>
                            <Select name="role" defaultValue={user.role}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="MODERATOR">Moderator</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button type="submit" size="sm" className="mt-2">
                              Update
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation - Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No posts yet</p>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="flex-1">
                        <Link href={`/post/${post.id}`} className="font-medium hover:underline">
                          {post.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {post.author.name} in {post.subject.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post._count.comments} comments • {post._count.votes} votes • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <form action={async (formData) => { "use server"; await deletePost(formData.get("id") as string); }}>
    <input type="hidden" name="id" value={post.id} />
    <Button type="submit" variant="destructive" size="sm">Delete</Button>
  </form>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation - Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {resources.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No resources yet</p>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {resource.type} uploaded by {resource.uploadedBy.name} in {resource.subject.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {resource.downloads} downloads • {new Date(resource.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <form action={async (formData) => { "use server"; await deleteResource(formData.get("id") as string); }}>
    <input type="hidden" name="id" value={resource.id} />
    <Button type="submit" variant="destructive" size="sm">Delete</Button>
  </form>
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
