import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="mb-4">
        <Skeleton className="h-9 w-48" />
      </div>

      <div className="mb-4 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="border rounded-lg overflow-hidden bg-muted/20 min-h-[600px] flex items-center justify-center">
        <Skeleton className="w-full h-[600px]" />
      </div>

      <div className="mt-4 flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
