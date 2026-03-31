import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="w-full space-y-8">
        <Skeleton className="h-12 w-full max-w-md rounded-md" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  )
}
