import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"

export const revalidate = 3600 // revalidate at most every hour

export default async function Home() {
  try {
    const semesters = await prisma.semester.findMany({
      include: {
        _count: {
          select: { subjects: true },
        },
      },
      orderBy: {
        number: "asc",
      },
    })

    if (!semesters || semesters.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <h2 className="text-2xl font-semibold">No semesters found</h2>
          <p className="text-muted-foreground">Please check back later or contact the administrator.</p>
        </div>
      )
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 md:py-24 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          CSITime
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          The ultimate academic resource and discussion platform for CSIT students in Nepal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {semesters.map((semester) => (
          <Link key={semester.id} href={`/semester/${semester.number}`} className="block group">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-semibold bg-background">
                    Semester {semester.number}
                  </Badge>
                  <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-2xl mt-4 line-clamp-1">{semester.title}</CardTitle>
                <CardDescription className="flex items-center pt-2">
                  <span className="font-medium text-foreground">{semester._count.subjects} Subjects</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Explore resources, past papers, notes, and discussions for all {semester.title.toLowerCase()} subjects.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch semesters:", error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-destructive/10 rounded-3xl border border-destructive/20">
        <h2 className="text-2xl font-bold text-destructive">Oops! Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          We encountered an error while loading the semester data. Please try refreshing the page.
        </p>
      </div>
    )
  }
}

