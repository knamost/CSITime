import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json({ posts: [], resources: [] })
  }

  const [posts, resources] = await Promise.all([
    prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
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
        title: { contains: query, mode: "insensitive" },
      },
      include: {
        subject: { select: { name: true } },
        uploadedBy: { select: { name: true } },
      },
      take: 10,
    }),
  ])

  return NextResponse.json({ posts, resources })
}
