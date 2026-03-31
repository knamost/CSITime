import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in duration-500">
      <div className="flex items-center text-muted-foreground mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> 
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-2 pt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-4" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-24" />
          </div>

          <div className="space-y-8">
            <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-24 w-full rounded-md" />
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-28 rounded-md" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
