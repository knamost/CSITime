"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UploadDropzone } from "@/utils/uploadthing"
import { createResource } from "@/app/actions/resource"
import { FileIcon, XIcon } from "lucide-react"

export function UploadForm({ subjectId }: { subjectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!fileUrl || !fileName) {
      toast.error("Please upload a file first")
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("subjectId", subjectId)
    formData.append("fileUrl", fileUrl)
    formData.append("fileName", fileName)

    try {
      const res = await createResource(formData)

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Resource uploaded successfully")
        setOpen(false)
        setFileUrl(null)
        setFileName(null)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
        // Only reset if they haven't submitted
        // Note: they might lose uploaded file url, but UT stores it anyway
        // Better UX: keep it if they close and reopen, or clear it.
        // Let's keep it simple and just close.
      }
    }}>
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
            <Label>File (PDF, Image, Video, Audio)</Label>
            {!fileUrl ? (
              <UploadDropzone
                endpoint="resourceUploader"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    setFileUrl(res[0].url)
                    setFileName(res[0].name)
                    toast.success("File uploaded to cloud!")
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload failed: ${error.message}`)
                }}
                className="ut-button:bg-primary ut-button:ut-readying:bg-primary/50 border-muted-foreground/20"
              />
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm truncate">{fileName}</span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setFileUrl(null)
                    setFileName(null)
                  }}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !fileUrl}>
            {loading ? "Saving..." : "Save Resource"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
