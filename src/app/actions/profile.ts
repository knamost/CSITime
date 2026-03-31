"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: {
  currentSemester?: number | null
  currentElective?: string | null
  username?: string | null
  name?: string | null
  image?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const updateData: any = {}
    if (data.currentSemester !== undefined) updateData.currentSemester = data.currentSemester
    if (data.currentElective !== undefined) updateData.currentElective = data.currentElective
    if (data.username !== undefined) updateData.username = data.username
    if (data.name !== undefined) updateData.name = data.name
    if (data.image !== undefined) updateData.image = data.image

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })
    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "Failed to update profile" }
  }
}

export async function getUserActivity() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
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
    return { user }
  } catch (error) {
    return { error: "Failed to fetch activity" }
  }
}
