import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ResourceList } from "@/components/resource-list"
import { DiscussionList } from "@/components/discussion-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  if (!q || q.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-xl font-semibold mb-2">Search CSITime</h2>
        <p className="text-muted-foreground">Enter at least 2 characters to search for resources and discussions.</p>
      </div>
    )
  }

  const [posts, resources] = await Promise.all([
    prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        author: { select: { name: true } },
        subject: { select: { name: true } },
        _count: { select: { comments: true, votes: true } },
      },
      take: 10,
    }),
    prisma.resource.findMany({
      where: {
        title: { contains: q, mode: "insensitive" },
      },
      include: {
        subject: { select: { name: true } },
        uploadedBy: { select: { name: true } },
      },
      take: 10,
    }),
  ])

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          Showing results for <span className="font-medium text-foreground">"{q}"</span>
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Discussions ({posts.length})</h2>
          {posts.length > 0 ? (
            <DiscussionList posts={posts as any} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No discussions found for "{q}"
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Resources ({resources.length})</h2>
          {resources.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <ResourceList resources={resources as any} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No resources found for "{q}"
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
