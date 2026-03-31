"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { deleteOwnPost } from "@/app/actions/discussion"
import { editPost } from "@/app/actions/edit"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export function PostActions({ post, isAuthor, isAdminOrMod }: { post: any, isAuthor: boolean, isAdminOrMod: boolean }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    const res = await editPost(post.id, formData.get("title") as string, formData.get("content") as string)
    setIsSaving(false)
    
    if (res.success) {
      toast.success("Post updated!")
      setIsEditing(false)
    } else {
      toast.error(res.error || "Failed to edit post")
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return
    const res = await deleteOwnPost(post.id)
    if (res.success) {
      toast.success("Post deleted")
      router.push("/posts")
    } else {
      toast.error(res.error || "Failed to delete post")
    }
  }

  const canDelete = isAuthor || isAdminOrMod

  return (
    <div className="flex items-center gap-1">
      {isAuthor && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger render={
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          } />
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>Edit Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input name="title" defaultValue={post.title} required minLength={5} />
                </div>
                <div className="space-y-2">
                  <Label>Content (Markdown supported)</Label>
                  <Textarea 
                    name="content" 
                    defaultValue={post.content} 
                    required 
                    minLength={10}
                    className="min-h-[200px]"
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
          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      )}
    </div>
  )
}
