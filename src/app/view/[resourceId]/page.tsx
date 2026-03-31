import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Download, AlertCircle } from "lucide-react"
import { ShareButton } from "./components/share-button"

export default async function ViewResourcePage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  let resource;
  try {
    resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        subject: true,
        uploadedBy: true,
      },
    })
  } catch (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">We encountered an error while fetching this resource.</p>
        <Link href="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-2xl font-bold mb-2">Resource not found</h1>
        <p className="text-muted-foreground mb-4">The resource you are looking for does not exist or has been removed.</p>
        <Link href="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    )
  }

  const fileName = resource.fileName
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || ""
  const filePath = resource.filePath

  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension)
  const isVideo = ["mp4", "webm", "ogg", "avi", "mov"].includes(fileExtension)
  const isAudio = ["mp3", "wav", "ogg", "flac", "aac"].includes(fileExtension)
  const isPDF = fileExtension === "pdf"

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="mb-4">
        <Link href={`/subject/${resource.subjectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {resource.subject.name}
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold">{resource.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-muted-foreground">
          <span>{resource.subject.name}</span>
          <span className="hidden sm:inline">•</span>
          <span>{resource.type.replace("_", " ")}</span>
          <span className="hidden sm:inline">•</span>
          <span>{resource.year || "N/A"}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Uploaded by {resource.uploadedBy.name || resource.uploadedBy.email}
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden bg-muted/20 min-h-[600px] flex items-center justify-center shadow-sm">
        {isPDF && (
          <iframe
            src={filePath}
            className="w-full h-[800px]"
            title={resource.title}
          />
        )}

        {isImage && (
          <img
            src={filePath}
            alt={resource.title}
            className="max-w-full max-h-[800px] object-contain"
          />
        )}

        {isVideo && (
          <video controls className="max-w-full max-h-[800px]">
            <source src={filePath} />
            Your browser does not support the video tag.
          </video>
        )}

        {isAudio && (
          <audio controls className="w-full max-w-md">
            <source src={filePath} />
            Your browser does not support the audio tag.
          </audio>
        )}

        {!isPDF && !isImage && !isVideo && !isAudio && (
          <div className="text-center p-8">
            <p className="mb-4">This file type cannot be previewed inline.</p>
            <a href={filePath} download target="_blank" rel="noopener noreferrer">
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <a href={filePath} download target="_blank" rel="noopener noreferrer">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </a>
        <ShareButton />
      </div>
    </div>
  )
}
