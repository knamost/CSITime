"use client"

import { useState } from "react"
import { updateProfile } from "@/app/actions/profile"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UploadButton } from "@/utils/uploadthing"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const ELECTIVES: Record<number, { value: string; label: string }[]> = {
  5: [
    { value: "Multimedia Computing", label: "Multimedia Computing (CSC330)" },
    { value: "Wireless Networking", label: "Wireless Networking (CSC331)" },
    { value: "Image Processing", label: "Image Processing (CSC332)" },
    { value: "Knowledge Management", label: "Knowledge Management (CSC333)" },
    { value: "Society and Ethics in Information Technology", label: "Society & Ethics in IT (CSC334)" },
    { value: "Microprocessor Based Design", label: "Microprocessor Based Design (CSC335)" },
  ],
  6: [
    { value: "Applied Logic", label: "Applied Logic (CSC380)" },
    { value: "E-commerce", label: "E-Commerce (CSC381)" },
    { value: "Automation and Robotics", label: "Automation & Robotics (CSC382)" },
    { value: "Neural Networks", label: "Neural Networks (CSC383)" },
    { value: "Computer Hardware Design", label: "Computer Hardware Design (CSC384)" },
    { value: "Cognitive Science", label: "Cognitive Science (CSC385)" },
  ],
  7: [
    { value: "Information Retrieval", label: "Information Retrieval (CSC423)" },
    { value: "Database Administration", label: "Database Administration (CSC424)" },
    { value: "Software Project Management", label: "Software Project Management (CSC425)" },
    { value: "Network Security", label: "Network Security (CSC426)" },
    { value: "Digital System Design", label: "Digital System Design (CSC427)" },
    { value: "International Marketing", label: "International Marketing (MGT428)" },
  ],
  8: [
    { value: "Advanced Networking with IPV6", label: "Advanced Networking with IPv6 (CSC477)" },
    { value: "Distributed Networking", label: "Distributed Networking (CSC478)" },
    { value: "Game Technology", label: "Game Technology (CSC479)" },
    { value: "Distributed and Object-Oriented Database", label: "Distributed & Object Oriented DB (CSC480)" },
    { value: "Introduction to Cloud Computing", label: "Cloud Computing (CSC481)" },
    { value: "Geographical Information System", label: "GIS (CSC482)" },
    { value: "Decision Support System and Expert System", label: "Decision Support System (CSC483)" },
    { value: "Mobile Application Development", label: "Mobile App Development (CSC484)" },
    { value: "Real Time Systems", label: "Real-Time Systems (CSC485)" },
    { value: "Network and System Administration", label: "Network & System Admin (CSC486)" },
    { value: "Embedded Systems Programming", label: "Embedded Systems (CSC487)" },
    { value: "International Business Management", label: "International Business (MGT488)" },
  ],
}

export function ProfileForm({ user }: { user: any }) {
  const [semester, setSemester] = useState<number | null>(user.currentSemester)
  const [elective, setElective] = useState<string | null>(user.currentElective)
  const [isSaving, setIsSaving] = useState(false)
  const [image, setImage] = useState<string | null>(user.image)

  const electives = semester ? ELECTIVES[semester] || [] : []
  const showElectives = semester && semester >= 5

  async function handleSaveBasic(formData: FormData) {
    setIsSaving(true)
    const res = await updateProfile({
      name: formData.get("name") as string,
      username: formData.get("username") as string,
    })
    setIsSaving(false)
    if (res.success) {
      toast.success("Profile updated successfully")
    } else {
      toast.error("Failed to update profile")
    }
  }

  async function handleSemesterChange(val: string | null) {
    if (!val) return
    const sem = val === "none" ? null : parseInt(val)
    setSemester(sem)
    setElective(null) // Reset elective when semester changes
    
    await updateProfile({
      currentSemester: sem,
      currentElective: null,
    })
    toast.success("Semester updated")
  }

  async function handleElectiveChange(val: string | null) {
    if (!val) return
    const elec = val === "none" ? null : val
    setElective(elec)
    
    await updateProfile({
      currentElective: elec,
    })
    toast.success("Elective updated")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={image || undefined} />
            <AvatarFallback className="text-xl">
              {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label>Upload new picture</Label>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={async (res) => {
                if (res?.[0]) {
                  setImage(res[0].url)
                  await updateProfile({ image: res[0].url })
                  toast.success("Avatar updated")
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`)
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSaveBasic} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                name="name" 
                id="name" 
                placeholder="Enter full name" 
                defaultValue={user.name || ""}
                className="max-w-md"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                name="username" 
                id="username" 
                placeholder="Enter username" 
                defaultValue={user.username || ""}
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground">Use this username to login instead of email</p>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user.email || ""} disabled className="max-w-md bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="semester">Current Semester</Label>
            <Select value={semester?.toString() || "none"} onValueChange={handleSemesterChange}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showElectives && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <Label htmlFor="elective">Current Elective (Semester {semester})</Label>
              <Select value={elective || "none"} onValueChange={handleElectiveChange}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Select elective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {electives.map((elec) => (
                    <SelectItem key={elec.value} value={elec.value}>
                      {elec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
