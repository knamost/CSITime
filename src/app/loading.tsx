import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center space-y-4 py-12 md:py-24 bg-muted/20 rounded-3xl">
        <Skeleton className="h-12 w-48 md:h-16 md:w-64" />
        <Skeleton className="h-6 w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="bg-muted/30 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
