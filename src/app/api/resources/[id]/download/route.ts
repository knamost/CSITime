import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const resource = await prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    })

    return NextResponse.redirect(new URL(resource.filePath, req.url))
  } catch (error) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 })
  }
}
