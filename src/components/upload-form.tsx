"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function UploadForm({ subjectId }: { subjectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("subjectId", subjectId)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Upload failed")
      } else {
        toast.success("Resource uploaded successfully")
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Upload Resource</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="E.g., 2023 Past Paper" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Resource Type</Label>
            <select
              id="type"
              name="type"
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="PAST_PAPER">Past Paper</option>
              <option value="NOTES">Notes</option>
              <option value="MODEL_QUESTION">Model Question</option>
              <option value="SOLUTION">Solution</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year (Optional)</Label>
            <Input id="year" name="year" type="number" placeholder="2023" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File (PDF only)</Label>
            <Input id="file" name="file" type="file" accept="application/pdf" required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
