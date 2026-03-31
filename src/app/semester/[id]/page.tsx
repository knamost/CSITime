import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"

export default async function SemesterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const semesterNumber = parseInt(id)

  if (isNaN(semesterNumber)) {
    notFound()
  }

  try {
    const semester = await prisma.semester.findUnique({
      where: { number: semesterNumber },
      include: {
        subjects: true,
      },
    })

    if (!semester) {
      notFound()
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center space-x-4">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{semester.title}</h1>
            <p className="text-muted-foreground">Select a subject to view resources and discussions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semester.subjects.map((subject) => (
            <Link key={subject.id} href={`/subject/${subject.id}`} className="block group">
              <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="mb-2">{subject.code}</Badge>
                    <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{subject.name}</CardTitle>
                  <CardDescription>View materials</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error(`Failed to fetch semester ${id}:`, error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-destructive/10 rounded-3xl border border-destructive/20">
        <h2 className="text-2xl font-bold text-destructive">Oops! Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          We encountered an error while loading the semester details. Please try refreshing the page.
        </p>
      </div>
    )
  }
}
