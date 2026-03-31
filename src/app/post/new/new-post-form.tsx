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

export function NewPostForm({ 
  subjects, 
  defaultSubjectId 
}: { 
  subjects: { id: string; name: string; code: string }[];
  defaultSubjectId?: string;
}) {
  const [loading, setLoading] = useState(false)
  
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
          id="content"
          name="content"
          required
          placeholder="Provide more context..."
          className="min-h-[200px]"
          minLength={10}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Link href={defaultSubjectId ? `/subject/${defaultSubjectId}` : "/"} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
        <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Discussion"}</Button>
      </div>
    </form>
  )
}
