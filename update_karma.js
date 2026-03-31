const fs = require('fs');

let discContent = fs.readFileSync('src/app/actions/discussion.ts', 'utf8');

// Add karma to createPost
if (!discContent.includes('increment: 5')) {
  discContent = discContent.replace(
    /const post = await prisma\.post\.create\(\{[\s\S]*?\}\)/,
    `const post = await prisma.post.create({
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
  })`
  );
}

// Add karma to createComment
if (!discContent.includes('increment: 2')) {
  discContent = discContent.replace(
    /await prisma\.comment\.create\(\{[\s\S]*?\}\)/,
    `await prisma.comment.create({
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
  })`
  );
}

// Add karma logic to toggleVote
if (!discContent.includes('karma: { increment: existing.value === value ? -value : (value * 2) }')) {
  discContent = discContent.replace(
    /if \(existing\) \{[\s\S]*?\} else \{/,
    `if (existing) {
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
  } else {`
  );
  
  discContent = discContent.replace(
    /await prisma\.vote\.create\(\{[\s\S]*?data: \{ userId: session\.user\.id, postId, value \},[\s\S]*?\}\)/,
    `await prisma.vote.create({
      data: { userId: session.user.id, postId, value },
    })
    // Add vote karma to post author
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
    if (post) {
      await prisma.user.update({ where: { id: post.authorId }, data: { karma: { increment: value } } })
    }`
  );
}

fs.writeFileSync('src/app/actions/discussion.ts', discContent);

let resContent = fs.readFileSync('src/app/actions/resource.ts', 'utf8');
if (!resContent.includes('increment: 10')) {
  resContent = resContent.replace(
    /const resource = await prisma\.resource\.create\(\{[\s\S]*?\}\)/,
    `const resource = await prisma.resource.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      subjectId: parsed.data.subjectId,
      year: parsed.data.year,
      uploadedById: session.user.id,
      fileName: parsed.data.fileName,
      filePath: parsed.data.filePath,
    },
  })

  // Award Karma
  await prisma.user.update({
    where: { id: session.user.id },
    data: { karma: { increment: 10 } }
  })`
  );
  fs.writeFileSync('src/app/actions/resource.ts', resContent);
}

console.log("Karma engine updated");
