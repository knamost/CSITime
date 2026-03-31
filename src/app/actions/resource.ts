"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const resourceSchema = z.object({
  title: z.string().min(2, "Title is required"),
  type: z.enum(["PAST_PAPER", "NOTES", "MODEL_QUESTION", "SOLUTION"]),
  subjectId: z.string(),
  year: z.string().optional(),
  fileUrl: z.string().url(),
  fileName: z.string(),
})

export async function createResource(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const data = Object.fromEntries(formData)
  const parsed = resourceSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const resource = await prisma.resource.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      subjectId: parsed.data.subjectId,
      year: parsed.data.year ? parseInt(parsed.data.year) : null,
      uploadedById: session.user.id,
      fileName: parsed.data.fileName,
      filePath: parsed.data.fileUrl,
    },
  })

  // Award Karma
  await prisma.user.update({
    where: { id: session.user.id },
    data: { karma: { increment: 10 } }
  })

    revalidatePath(`/subject/${parsed.data.subjectId}`)
    return { success: true, resource }
  } catch (error) {
    console.error("Database error creating resource:", error)
    return { error: "Failed to create resource record" }
  }
}
