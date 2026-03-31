import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="bg-muted p-4 rounded-full">
        <FileQuestion className="h-16 w-16 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">404 - Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for does not exist or has been moved. 
          Please check the URL or return to the homepage.
        </p>
      </div>
      <Link href="/"  className={buttonVariants({ size: "lg" })}>Return to Homepage</Link>
    </div>
  )
}
