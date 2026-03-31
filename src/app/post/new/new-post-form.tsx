"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createPost } from "@/app/actions/discussion"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UploadButton } from "@/utils/uploadthing"
import { useRef } from "react"

export function NewPostForm({ 
  subjects, 
  defaultSubjectId 
}: { 
  subjects: { id: string; name: string; code: string }[];
  defaultSubjectId?: string;
}) {
  const [loading, setLoading] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [contentVal, setContentVal] = useState("")
  
  async function action(formData: FormData) {
    setLoading(true)
    const res = await createPost(formData)
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    }
  }

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="subjectId">Subject</Label>
        <select
          id="subjectId"
          name="subjectId"
          required
          defaultValue={defaultSubjectId || ""}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>Select a subject...</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name} ({sub.code})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="What do you want to discuss?"
          minLength={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Details</Label>
        <Textarea
          ref={contentRef}
          id="content"
          name="content"
          required
          placeholder="Provide more context... (Markdown supported)"
          className="min-h-[200px]"
          minLength={10}
          value={contentVal}
          onChange={(e) => setContentVal(e.target.value)}
        />
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <span>Attach media:</span>
          <UploadButton
            endpoint="resourceUploader"
            appearance={{ button: "h-8 px-3 text-xs", allowedContent: "hidden" }}
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                const url = res[0].url;
                const name = res[0].name;
                const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
                const markdown = isImage ? "\n![" + name + "](" + url + ")\n" : "\n[" + name + "](" + url + ")\n";
                
                const cursorPosition = contentRef.current?.selectionStart || contentVal.length;
                const newText = contentVal.substring(0, cursorPosition) + markdown + contentVal.substring(cursorPosition);
                setContentVal(newText);
                toast.success("Media attached!");
              }
            }}
            onUploadError={(error) => {
              toast.error("Upload failed: " + error.message);
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link href={defaultSubjectId ? `/subject/${defaultSubjectId}` : "/"} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
        <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Discussion"}</Button>
      </div>
    </form>
  )
}
