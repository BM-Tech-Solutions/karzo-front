"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { createJob } from "@/lib/api-service"

export default function NewJobPage() {
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState<string[]>([])
  const [newRequirement, setNewRequirement] = useState("")
  const [creating, setCreating] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  if (!isLoading && (!user || user.role !== "admin")) {
    router.push("/login")
    return null
  }

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleCreate = async () => {
    // Basic validation
    if (!title.trim() || !company.trim() || !location.trim() || !description.trim() || requirements.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and add at least one requirement.",
        variant: "destructive",
      })
      return
    }
  
    try {
      setCreating(true)
      const newJob = await createJob({
        title,
        company,
        location,
        description,
        requirements,
      })
      
      toast({
        title: "Job created",
        description: "The job posting has been created successfully.",
      })
      
      // Force a hard redirect to ensure navigation works
      window.location.href = '/admin'
    } catch (err) {
      console.error("Error creating job:", err)
      toast({
        title: "Creation failed",
        description: "There was an error creating the job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (isLoading || !user || user.role !== "admin") {
    return <div>Loading...</div>
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Create New Job Posting</h1>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the details of the new job posting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. TechCorp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Remote, New York, NY"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the job role, responsibilities, and ideal candidate..."
                        rows={6}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                  <CardDescription>Add job requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add a new requirement..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddRequirement()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddRequirement}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{requirement}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRequirement(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {requirements.length === 0 && (
                      <div className="text-center p-4 text-muted-foreground">
                        No requirements added yet. Add some requirements above.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating ? "Creating..." : "Create Job"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    </AuthProvider>
  )
}