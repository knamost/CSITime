"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  subjectId: z.string(),
})

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const data = Object.fromEntries(formData)
  const parsed = postSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      subjectId: parsed.data.subjectId,
      authorId: session.user.id,
    },
  })

  // Award Karma
  await prisma.user.update({
    where: { id: session.user.id },
    data: { karma: { increment: 5 } }
  })

  revalidatePath(`/subject/${parsed.data.subjectId}`)
  redirect(`/post/${post.id}`)
}

const commentSchema = z.object({
  content: z.string().min(2, "Comment is too short"),
  postId: z.string(),
  parentId: z.string().optional(),
})

export async function createComment(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const data = Object.fromEntries(formData)
  const parsed = commentSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  await prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId: parsed.data.postId,
      authorId: session.user.id,
      parentId: parsed.data.parentId || null,
    },
  })

  // Award Karma
  await prisma.user.update({
    where: { id: session.user.id },
    data: { karma: { increment: 2 } }
  })

  revalidatePath(`/post/${parsed.data.postId}`)
  return { success: true }
}

export async function toggleVote(postId: string, value: 1 | -1) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const existing = await prisma.vote.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  })

  if (existing) {
    if (existing.value === value) {
      await prisma.vote.delete({
        where: { userId_postId: { userId: session.user.id, postId } },
      })
      // Remove vote karma from post author
      const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
      if (post) {
        await prisma.user.update({ where: { id: post.authorId }, data: { karma: { decrement: value } } })
      }
    } else {
      await prisma.vote.update({
        where: { userId_postId: { userId: session.user.id, postId } },
        data: { value },
      })
      // Adjust vote karma for post author (e.g. going from -1 to +1 is a +2 change)
      const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
      if (post) {
        await prisma.user.update({ where: { id: post.authorId }, data: { karma: { increment: value * 2 } } })
      }
    }
  } else {
    await prisma.vote.create({
      data: { userId: session.user.id, postId, value },
    })
    // Add vote karma to post author
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
    if (post) {
      await prisma.user.update({ where: { id: post.authorId }, data: { karma: { increment: value } } })
    }
  }

  revalidatePath(`/post/${postId}`)
  return { success: true }
}

export async function deleteOwnPost(postId: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  })

  if (!post) {
    return { error: "Not found" }
  }

  if (post.authorId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    return { error: "Unauthorized" }
  }

  await prisma.post.delete({
    where: { id: postId }
  })

  revalidatePath("/posts")
  return { success: true }
}

export async function deleteOwnResource(resourceId: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  })

  if (!resource) {
    return { error: "Not found" }
  }

  if (resource.uploadedById !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    return { error: "Unauthorized" }
  }

  // Delete from uploadthing if applicable
  if (resource.filePath && resource.filePath.includes('uploadthing.com')) {
    const fileKey = resource.filePath.split('/').pop()
    if (fileKey) {
      try {
        const { UTApi } = await import("uploadthing/server")
        const utapi = new UTApi()
        await utapi.deleteFiles(fileKey)
      } catch (e) {
        console.error("Failed to delete from uploadthing:", e)
      }
    }
  }

  await prisma.resource.delete({
    where: { id: resourceId }
  })

  revalidatePath("/profile")
  return { success: true }
}

export async function deleteOwnComment(commentId: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true }
  })

  if (!comment) {
    return { error: "Not found" }
  }

  if (comment.authorId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    return { error: "Unauthorized" }
  }

  await prisma.comment.delete({
    where: { id: commentId }
  })

  revalidatePath(`/post/${comment.postId}`)
  return { success: true }
}
