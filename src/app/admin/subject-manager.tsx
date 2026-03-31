"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSubject, updateSubject } from "@/app/actions/admin"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

type SubjectWithDetails = {
  id: string
  name: string
  code: string
  semesterId: number
  semester: { id: number; title: string; number: number }
  _count: { posts: number; resources: number }
}

export function SubjectManager({ subjects }: { subjects: SubjectWithDetails[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<SubjectWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const semesterId = parseInt(formData.get("semesterId") as string)

    try {
      if (editingSubject) {
        const result = await updateSubject(editingSubject.id, name, code, semesterId)
        if (result.error) throw new Error(result.error)
        toast.success("Subject updated successfully")
      } else {
        const result = await createSubject(name, code, semesterId)
        if (result.error) throw new Error(result.error)
        toast.success("Subject created successfully")
      }
      setIsOpen(false)
      setEditingSubject(null)
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const openEdit = (subject: SubjectWithDetails) => {
    setEditingSubject(subject)
    setIsOpen(true)
  }

  const openCreate = () => {
    setEditingSubject(null)
    setIsOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Subjects</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreate} />}>
            Add Subject
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubject ? "Edit Subject" : "Add Subject"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input id="name" name="name" defaultValue={editingSubject?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input id="code" name="code" defaultValue={editingSubject?.code} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semesterId">Semester</Label>
                <Select name="semesterId" defaultValue={editingSubject?.semesterId.toString()} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Subject"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead className="text-right">Posts</TableHead>
              <TableHead className="text-right">Resources</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.code}</TableCell>
                <TableCell>{subject.name}</TableCell>
                <TableCell>Semester {subject.semesterId}</TableCell>
                <TableCell className="text-right">{subject._count.posts}</TableCell>
                <TableCell className="text-right">{subject._count.resources}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(subject)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
