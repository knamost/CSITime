"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleBookmark(postId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("You must be logged in to bookmark.")
  }

  const userId = session.user.id

  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      }
    }
  })

  if (existingBookmark) {
    await prisma.bookmark.delete({
      where: {
        id: existingBookmark.id
      }
    })
  } else {
    await prisma.bookmark.create({
      data: {
        userId,
        postId,
      }
    })
  }

  revalidatePath(`/post/${postId}`)
  revalidatePath(`/profile`)
  return { success: true }
}
