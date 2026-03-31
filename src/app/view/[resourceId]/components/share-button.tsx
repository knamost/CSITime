"use client"

import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <Button variant="outline" onClick={handleShare}>
      {copied ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Share2 className="mr-2 h-4 w-4" />
      )}
      {copied ? "Copied!" : "Share"}
    </Button>
  )
}
