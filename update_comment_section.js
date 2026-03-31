const fs = require('fs');

let content = fs.readFileSync('src/app/post/[id]/comment-section.tsx', 'utf8');

// Imports
if (!content.includes('CommentActions')) {
  content = content.replace(
    /import remarkGfm from "remark-gfm"/,
    `import remarkGfm from "remark-gfm"\nimport { CommentActions } from "./comment-actions"`
  );
}

// Add roles inside component
content = content.replace(
  /const \[replyingTo, setReplyingTo\] = useState<string \| null>\(null\)/,
  `const [replyingTo, setReplyingTo] = useState<string | null>(null)\n  const isAdminOrMod = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR"`
);

// Map root comments
content = content.replace(
  /<div key=\{comment\.id\} className="space-y-4">/,
  `<div key={comment.id} className="space-y-4 group">`
);

content = content.replace(
  /\{formatDistanceToNow\(new Date\(comment\.createdAt\), \{ addSuffix: true \}\)\}\n\s*<\/span>\n\s*<\/div>/,
  `{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {comment.isEdited && <span className="text-xs italic text-muted-foreground">(edited)</span>}
                  <CommentActions comment={comment} isAuthor={session?.user?.id === comment.authorId} isAdminOrMod={isAdminOrMod} />
                </div>`
);

// Map reply comments
content = content.replace(
  /<div key=\{reply\.id\} className="flex gap-4">/,
  `<div key={reply.id} className="flex gap-4 group">`
);

content = content.replace(
  /\{formatDistanceToNow\(new Date\(reply\.createdAt\), \{ addSuffix: true \}\)\}\n\s*<\/span>\n\s*<\/div>/,
  `{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                        {reply.isEdited && <span className="text-xs italic text-muted-foreground">(edited)</span>}
                        <CommentActions comment={reply} isAuthor={session?.user?.id === reply.authorId} isAdminOrMod={isAdminOrMod} />
                      </div>`
);

fs.writeFileSync('src/app/post/[id]/comment-section.tsx', content);
console.log("CommentSection updated");
