"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { deleteOwnResource } from "@/app/actions/discussion"
import { editResource } from "@/app/actions/edit"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ResourceActionsProps {
  resource: {
    id: string
    title: string
    type: string
    year: number | null
  }
}

export function ResourceActions({ resource }: ResourceActionsProps) {
  const router = useRouter()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [editForm, setEditForm] = useState({
    title: resource.title,
    type: resource.type,
    year: resource.year?.toString() || "",
  })

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteOwnResource(resource.id)
      if (result.error) throw new Error(result.error)
      toast.success("Resource deleted successfully")
      setShowDeleteAlert(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete resource")
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setIsEditing(true)
    try {
      const yearInt = editForm.year ? parseInt(editForm.year) : null
      const result = await editResource(resource.id, editForm.title, editForm.type, yearInt)
      if (result.error) throw new Error(result.error)
      toast.success("Resource updated successfully")
      setShowEditDialog(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update resource")
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0" />}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your resource
              and remove the file from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAlert(false)} disabled={isDeleting}>Cancel</Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Resource Type</Label>
              <Select 
                value={editForm.type} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value || "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAST_PAPER">Past Paper</SelectItem>
                  <SelectItem value="NOTES">Notes</SelectItem>
                  <SelectItem value="MODEL_QUESTION">Model Question</SelectItem>
                  <SelectItem value="SOLUTION">Solution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year (Optional)</Label>
              <Input
                id="year"
                type="number"
                value={editForm.year}
                onChange={(e) => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                placeholder="e.g. 2023"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isEditing}>
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
