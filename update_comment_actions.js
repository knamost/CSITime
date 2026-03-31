const fs = require('fs');

let discContent = fs.readFileSync('src/app/actions/discussion.ts', 'utf8');

if (!discContent.includes('deleteOwnComment')) {
  discContent += `
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

  revalidatePath(\`/post/\${comment.postId}\`)
  return { success: true }
}
`;
  fs.writeFileSync('src/app/actions/discussion.ts', discContent);
}
console.log("Added deleteOwnComment action");
