import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const title = formData.get("title") as string
  const type = formData.get("type") as string
  const subjectId = formData.get("subjectId") as string
  const year = formData.get("year") as string

  if (!file || !title || !type || !subjectId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large, max 10MB" }, { status: 400 })
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = join(process.cwd(), "public/uploads")
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${file.name.replace(/\\s+/g, "_")}`
    await writeFile(join(uploadDir, fileName), buffer)

    const resource = await prisma.resource.create({
      data: {
        title,
        type: type as any,
        fileName: file.name,
        filePath: `/uploads/${fileName}`,
        subjectId,
        uploadedById: session.user.id,
        year: year ? parseInt(year) : null,
      },
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
