import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateProfile, getUserActivity } from "@/app/actions/profile"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const ELECTIVES: Record<number, { value: string; label: string }[]> = {
  5: [
    { value: "Multimedia Computing", label: "Multimedia Computing (CSC330)" },
    { value: "Wireless Networking", label: "Wireless Networking (CSC331)" },
    { value: "Image Processing", label: "Image Processing (CSC332)" },
    { value: "Knowledge Management", label: "Knowledge Management (CSC333)" },
    { value: "Society and Ethics in Information Technology", label: "Society & Ethics in IT (CSC334)" },
    { value: "Microprocessor Based Design", label: "Microprocessor Based Design (CSC335)" },
  ],
  6: [
    { value: "Applied Logic", label: "Applied Logic (CSC380)" },
    { value: "E-commerce", label: "E-Commerce (CSC381)" },
    { value: "Automation and Robotics", label: "Automation & Robotics (CSC382)" },
    { value: "Neural Networks", label: "Neural Networks (CSC383)" },
    { value: "Computer Hardware Design", label: "Computer Hardware Design (CSC384)" },
    { value: "Cognitive Science", label: "Cognitive Science (CSC385)" },
  ],
  7: [
    { value: "Information Retrieval", label: "Information Retrieval (CSC423)" },
    { value: "Database Administration", label: "Database Administration (CSC424)" },
    { value: "Software Project Management", label: "Software Project Management (CSC425)" },
    { value: "Network Security", label: "Network Security (CSC426)" },
    { value: "Digital System Design", label: "Digital System Design (CSC427)" },
    { value: "International Marketing", label: "International Marketing (MGT428)" },
  ],
  8: [
    { value: "Advanced Networking with IPV6", label: "Advanced Networking with IPv6 (CSC477)" },
    { value: "Distributed Networking", label: "Distributed Networking (CSC478)" },
    { value: "Game Technology", label: "Game Technology (CSC479)" },
    { value: "Distributed and Object-Oriented Database", label: "Distributed & Object Oriented DB (CSC480)" },
    { value: "Introduction to Cloud Computing", label: "Cloud Computing (CSC481)" },
    { value: "Geographical Information System", label: "GIS (CSC482)" },
    { value: "Decision Support System and Expert System", label: "Decision Support System (CSC483)" },
    { value: "Mobile Application Development", label: "Mobile App Development (CSC484)" },
    { value: "Real Time Systems", label: "Real-Time Systems (CSC485)" },
    { value: "Network and System Administration", label: "Network & System Admin (CSC486)" },
    { value: "Embedded Systems Programming", label: "Embedded Systems (CSC487)" },
    { value: "International Business Management", label: "International Business (MGT488)" },
  ],
}

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
    },
  })

  if (!user) {
    redirect("/login")
  }

  const showElective = user.currentSemester && user.currentSemester >= 5
  const electives = user.currentSemester ? ELECTIVES[user.currentSemester] : []

  async function updateSemester(formData: FormData) {
    "use server"
    const semester = formData.get("semester")
    await updateProfile({
      currentSemester: semester === "none" ? null : parseInt(semester as string),
      currentElective: null,
    })
  }

  async function updateElective(formData: FormData) {
    "use server"
    const elective = formData.get("elective")
    await updateProfile({
      currentElective: elective === "none" ? null : elective as string,
    })
  }

  async function updateUsername(formData: FormData) {
    "use server"
    const username = formData.get("username") as string
    await updateProfile({
      username: username.trim() === "" ? null : username.trim(),
    })
  }

  const isAdminOrModerator = user.role === "ADMIN" || user.role === "MODERATOR"

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{user.name || "Not set"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Username</Label>
              <p className="font-medium">{user.username || "Not set"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email || "Not set"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="font-medium capitalize">{user.role.toLowerCase()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Karma</Label>
              <p className="font-medium">{user.karma}</p>
            </div>
          </div>
          
          {isAdminOrModerator && (
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin">
                <Button variant="default">
                  Enter Dashboard
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Academic Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={updateUsername} className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <Input 
                name="username" 
                id="username" 
                placeholder="Enter username" 
                defaultValue={user.username || ""}
                className="max-w-md"
              />
              <Button type="submit" size="sm">
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Use this username to login instead of email</p>
          </form>

          <form action={updateSemester} className="space-y-2">
            <Label htmlFor="semester">Current Semester</Label>
            <Select name="semester" defaultValue={user.currentSemester?.toString() || "none"}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="sm" className="mt-2">
              Save Semester
            </Button>
          </form>

          {showElective && (
            <form action={updateElective} className="space-y-2">
              <Label htmlFor="elective">Current Elective (Semester {user.currentSemester})</Label>
              <Select name="elective" defaultValue={user.currentElective || "none"}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Select elective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {electives.map((elec) => (
                    <SelectItem key={elec.value} value={elec.value}>
                      {elec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" size="sm" className="mt-2">
                Save Elective
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">My Posts ({user.posts.length})</TabsTrigger>
          <TabsTrigger value="resources">My Resources ({user.resources.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-4">
          {user.posts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {user.posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <Link href={`/post/${post.id}`} className="font-medium hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      in {post.subject.name} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="resources" className="mt-4">
          {user.resources.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No resources uploaded yet</p>
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
                      <span className="text-sm bg-muted px-2 py-1 rounded">{resource.downloads} downloads</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
