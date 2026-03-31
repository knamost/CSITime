const fs = require('fs');

let postContent = fs.readFileSync('src/app/post/[id]/page.tsx', 'utf8');

// Add import
if (!postContent.includes('PostActions')) {
  postContent = postContent.replace(
    /import \{ CommentSection \} from "\.\/comment-section"/,
    `import { CommentSection } from "./comment-section"\nimport { PostActions } from "./post-actions"`
  );
}

// Remove old delete stuff
postContent = postContent.replace(
  /const isAuthorOrAdmin = session\?\.user && \(session\.user\.id === post\.authorId \|\| session\.user\.role === "ADMIN" \|\| session\.user\.role === "MODERATOR"\)/,
  `const isAuthor = session?.user?.id === post.authorId\n    const isAdminOrMod = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR"`
);
postContent = postContent.replace(
  /async function handleDeleteOwnPost\(\) \{[\s\S]*?redirect\('\/posts'\)\n    \}/,
  ""
);

postContent = postContent.replace(
  /\{isAuthorOrAdmin && \([\s\S]*?<\/Button>\n\s*<\/form>\n\s*<\/>\n\s*\)\}/,
  `<PostActions post={post} isAuthor={isAuthor} isAdminOrMod={isAdminOrMod} />`
);

// Add edited badge
postContent = postContent.replace(
  /<span className="flex items-center gap-1">\s*<Clock className="h-3 w-3" \/>\s*\{formatDistanceToNow\(new Date\(post\.createdAt\), \{ addSuffix: true \}\)\}\s*<\/span>/,
  `<span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                {post.isEdited && <span className="text-xs italic text-muted-foreground">(edited)</span>}`
);

fs.writeFileSync('src/app/post/[id]/page.tsx', postContent);
console.log("Post page updated");
