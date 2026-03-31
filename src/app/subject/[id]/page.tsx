import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, MessageSquare, Info, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResourceList } from "@/components/resource-list"
import { UploadForm } from "@/components/upload-form"
import { DiscussionList } from "@/components/discussion-list"
import { auth } from "@/auth"

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const [subject, session] = await Promise.all([
      prisma.subject.findUnique({
        where: { id },
        include: {
          semester: true,
          resources: {
            include: {
              uploadedBy: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" }
          },
          posts: {
            include: {
              author: { select: { name: true } },
              _count: { select: { comments: true, votes: true } }
            },
            orderBy: { createdAt: "desc" }
          }
        },
      }),
      auth()
    ])

    if (!subject) {
      notFound()
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center space-x-4">
          <Link href={`/semester/${subject.semester.number}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-muted-foreground">{subject.code} — Semester {subject.semester.number}</p>
          </div>
        </div>

        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="discussion" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">Discussion</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" /> <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resources for {subject.name}</CardTitle>
                {session?.user && <UploadForm subjectId={subject.id} />}
              </CardHeader>
              <CardContent>
                <ResourceList resources={subject.resources as any} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussion" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Discussion Forum</CardTitle>
                {session?.user ? (
                  <Link href={`/post/new?subjectId=${subject.id}`} className={buttonVariants()}>
                    <Plus className="h-4 w-4 mr-2" /> New Post
                  </Link>
                ) : (
                  <Link href="/login"  className={buttonVariants({ variant: "outline" })}>Login to post</Link>
                )}
              </CardHeader>
              <CardContent>
                <DiscussionList posts={subject.posts as any} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Subject Name</h3>
                  <p>{subject.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Subject Code</h3>
                  <p>{subject.code}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Semester</h3>
                  <p>{subject.semester.title} (Semester {subject.semester.number})</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error(`Failed to fetch subject ${id}:`, error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-destructive/10 rounded-3xl border border-destructive/20">
        <h2 className="text-2xl font-bold text-destructive">Oops! Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          We encountered an error while loading the subject details. Please try refreshing the page.
        </p>
      </div>
    )
  }
}
