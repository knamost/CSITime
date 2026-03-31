"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { deleteOwnComment } from "@/app/actions/discussion"
import { editComment } from "@/app/actions/edit"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CommentActions({ comment, isAuthor, isAdminOrMod }: { comment: any, isAuthor: boolean, isAdminOrMod: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    const res = await editComment(comment.id, formData.get("content") as string)
    setIsSaving(false)
    
    if (res.success) {
      toast.success("Comment updated!")
      setIsEditing(false)
    } else {
      toast.error(res.error || "Failed to edit comment")
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this comment?")) return
    const res = await deleteOwnComment(comment.id)
    if (res.success) {
      toast.success("Comment deleted")
    } else {
      toast.error(res.error || "Failed to delete comment")
    }
  }

  const canDelete = isAuthor || isAdminOrMod

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {isAuthor && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger render={
            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-primary">
              <Pencil className="h-3 w-3" />
              <span className="sr-only">Edit</span>
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>Edit Comment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Content (Markdown supported)</Label>
                  <Textarea 
                    name="content" 
                    defaultValue={comment.content} 
                    required 
                    minLength={2}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {canDelete && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDelete}
          className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3" />
          <span className="sr-only">Delete</span>
        </Button>
      )}
    </div>
  )
}
