"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function editPost(postId: string, newTitle: string, newContent: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return { error: "Not found" }
  
  if (post.authorId !== session.user.id) return { error: "Only the author can edit their post." }

  // Save history
  await prisma.postHistory.create({
    data: {
      postId: post.id,
      title: post.title,
      content: post.content,
    }
  })

  await prisma.post.update({
    where: { id: postId },
    data: { 
      title: newTitle, 
      content: newContent,
      isEdited: true,
    }
  })

  revalidatePath(`/post/${postId}`)
  revalidatePath(`/posts`)
  return { success: true }
}

export async function editComment(commentId: string, newContent: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) return { error: "Not found" }
  
  if (comment.authorId !== session.user.id) return { error: "Only the author can edit their comment." }

  // Save history
  await prisma.commentHistory.create({
    data: {
      commentId: comment.id,
      content: comment.content,
    }
  })

  await prisma.comment.update({
    where: { id: commentId },
    data: { 
      content: newContent,
      isEdited: true,
    }
  })

  revalidatePath(`/post/${comment.postId}`)
  return { success: true }
}

export async function editResource(resourceId: string, newTitle: string, newType: string, newYear: number | null) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const resource = await prisma.resource.findUnique({ where: { id: resourceId } })
  if (!resource) return { error: "Not found" }
  
  if (resource.uploadedById !== session.user.id) return { error: "Only the uploader can edit this resource." }

  await prisma.resource.update({
    where: { id: resourceId },
    data: { 
      title: newTitle,
      type: newType as any,
      year: newYear,
      isEdited: true,
    }
  })

  revalidatePath(`/profile`)
  revalidatePath(`/search`)
  return { success: true }
}

export async function getPostHistory(postId: string) {
  return await prisma.postHistory.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" }
  })
}

export async function getCommentHistory(commentId: string) {
  return await prisma.commentHistory.findMany({
    where: { commentId },
    orderBy: { createdAt: "desc" }
  })
}
