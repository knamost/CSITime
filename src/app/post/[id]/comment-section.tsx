"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { formatDistanceToNow } from "date-fns"
import { createComment } from "@/app/actions/discussion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { UploadButton } from "@/utils/uploadthing"
import { useRef } from "react"
import { toast } from "sonner"
import { Session } from "next-auth"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CommentActions } from "./comment-actions"
import { CommentHistoryModal } from "./comment-history-modal"

function SubmitButton({ label = "Reply" }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : label}
    </Button>
  )
}

function CommentForm({ postId, parentId, onSuccess }: { postId: string; parentId?: string; onSuccess?: () => void }) {
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [contentVal, setContentVal] = useState("")
  async function action(formData: FormData) {
    const res = await createComment(formData)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Comment added")
      if (onSuccess) onSuccess()
      const form = document.getElementById(`form-${parentId || "root"}`) as HTMLFormElement
      if (form) { form.reset(); setContentVal(""); }
    }
  }

  return (
    <form id={`form-${parentId || "root"}`} action={action} className="space-y-4">
      <input type="hidden" name="postId" value={postId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <Textarea 
        ref={contentRef}
        name="content" 
        placeholder="Write a comment... (Markdown supported)" 
        required 
        minLength={2} 
        className="min-h-[100px]" 
        value={contentVal}
        onChange={(e) => setContentVal(e.target.value)}
      />
      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
        <span>Attach media:</span>
        <UploadButton
          endpoint="resourceUploader"
          appearance={{ button: "h-8 px-3 text-xs", allowedContent: "hidden" }}
          onClientUploadComplete={(res) => {
            if (res?.[0]) {
              const url = res[0].url;
              const name = res[0].name;
              const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
              const markdown = isImage ? "\n![" + name + "](" + url + ")\n" : "\n[" + name + "](" + url + ")\n";
              
              const cursorPosition = contentRef.current?.selectionStart || contentVal.length;
              const newText = contentVal.substring(0, cursorPosition) + markdown + contentVal.substring(cursorPosition);
              setContentVal(newText);
              toast.success("Media attached!");
            }
          }}
          onUploadError={(error) => {
            toast.error("Upload failed: " + error.message);
          }}
        />
      </div>
      <div className="flex justify-end gap-2">
        {onSuccess && (
          <Button type="button" variant="ghost" onClick={onSuccess}>
            Cancel
          </Button>
        )}
        <SubmitButton label={parentId ? "Reply" : "Post Comment"} />
      </div>
    </form>
  )
}

export function CommentSection({
  postId,
  comments,
  session,
}: {
  postId: string
  comments: any[]
  session: Session | null
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const isAdminOrMod = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR"

  return (
    <div className="space-y-8">
      {session ? (
        <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CommentForm postId={postId} />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-muted/30 rounded-lg border text-center">
          <p className="text-muted-foreground mb-4">Please log in to participate in the discussion.</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4 group">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {comment.isEdited && <CommentHistoryModal commentId={comment.id} />}
                  <CommentActions comment={comment} isAuthor={session?.user?.id === comment.authorId} isAdminOrMod={isAdminOrMod} />
                </div>
                <div className="text-sm prose prose-neutral dark:prose-invert max-w-none break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
                </div>
                {session && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    Reply
                  </Button>
                )}
                {replyingTo === comment.id && (
                  <div className="mt-4 pl-4 border-l-2">
                    <CommentForm postId={postId} parentId={comment.id} onSuccess={() => setReplyingTo(null)} />
                  </div>
                )}
              </div>
            </div>

            {comment.replies.length > 0 && (
              <div className="space-y-4 pl-14">
                {comment.replies.map((reply: any) => (
                  <div key={reply.id} className="flex gap-4 group">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{reply.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                        {reply.isEdited && <CommentHistoryModal commentId={reply.id} />}
                        <CommentActions comment={reply} isAuthor={session?.user?.id === reply.authorId} isAdminOrMod={isAdminOrMod} />
                      </div>
                      <div className="text-sm prose prose-neutral dark:prose-invert max-w-none break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{reply.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
