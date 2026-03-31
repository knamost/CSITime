import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewPostForm } from "./new-post-form"

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { subjectId } = await searchParams
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Start a new discussion</CardTitle>
          <CardDescription>
            Ask a question, share a tip, or start a study group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewPostForm subjects={subjects} defaultSubjectId={subjectId} />
        </CardContent>
      </Card>
    </div>
  )
}
