"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma, Role } from "@prisma/client"

export async function getAllUsers() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        karma: true,
        currentSemester: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            resources: true,
          },
        },
      },
    })
    return { users }
  } catch (error) {
    return { error: "Failed to fetch users" }
  }
}

export async function updateUserRole(userId: string, role: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update role" }
  }
}

export async function getAllPosts() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: { select: { id: true, name: true, email: true } },
        subject: { select: { id: true, name: true } },
        _count: { select: { comments: true, votes: true } },
      },
    })
    return { posts }
  } catch (error) {
    return { error: "Failed to fetch posts" }
  }
}

export async function getAllResources() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        subject: { select: { id: true, name: true } },
      },
    })
    return { resources }
  } catch (error) {
    return { error: "Failed to fetch resources" }
  }
}

export async function deletePost(postId: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.post.delete({ where: { id: postId } })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete post" }
  }
}

export async function deleteResource(resourceId: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } })
    if (resource) {
      const fs = await import("fs")
      const path = await import("path")
      const filePath = path.join(process.cwd(), "public", resource.filePath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    await prisma.resource.delete({ where: { id: resourceId } })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete resource" }
  }
}
