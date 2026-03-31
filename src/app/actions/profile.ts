"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: {
  currentSemester?: number | null
  currentElective?: string | null
  username?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currentSemester: data.currentSemester ?? null,
        currentElective: data.currentElective ?? null,
        username: data.username ?? null,
      },
    })
    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
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
