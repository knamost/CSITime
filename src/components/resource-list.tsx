"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { Download, FileText, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

type Resource = {
  id: string
  title: string
  type: string
  year: number | null
  downloads: number
  createdAt: Date
  uploadedBy: { name: string }
  fileName: string
}

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || ""
}

function canPreview(fileName: string): boolean {
  const ext = getFileExtension(fileName)
  const previewable = ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm", "ogg", "pdf"]
  return previewable.includes(ext)
}

export function ResourceList({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground">No resources uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <div key={resource.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex flex-col space-y-1 mb-4 sm:mb-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{resource.title}</span>
              <Badge variant="outline">{resource.type.replace("_", " ")}</Badge>
              {resource.year && <Badge>{resource.year}</Badge>}
            </div>
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <span>Uploaded by {resource.uploadedBy.name}</span>
              <span>{formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}</span>
              <span>{resource.downloads} downloads</span>
            </div>
          </div>
          <div className="flex gap-2">
            {canPreview(resource.fileName) && (
              <Link href={`/view/${resource.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Link>
            )}
            <a href={`/api/resources/${resource.id}/download`} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Download className="mr-2 h-4 w-4" /> Download
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
