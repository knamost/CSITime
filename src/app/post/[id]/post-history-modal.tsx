"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getPostHistory } from "@/app/actions/edit"

export function PostHistoryModal({ postId }: { postId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && history.length === 0) {
      setIsLoading(true)
      getPostHistory(postId).then(data => {
        setHistory(data)
        setIsLoading(false)
      })
    }
  }, [isOpen, postId, history.length])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-6 px-2"><History className="h-3 w-3 mr-1" /> (edited)</Button>} />
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit History</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No previous versions found.</p>
          ) : (
            history.map((entry, index) => (
              <div key={entry.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">
                    Version {history.length - index}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <h4 className="font-medium mb-2">{entry.title}</h4>
                  <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
