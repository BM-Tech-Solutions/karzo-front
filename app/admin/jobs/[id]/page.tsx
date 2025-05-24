"use client"

import { useEffect, useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { fetchJob, updateJob } from "@/lib/api-service"
import type { Params } from "next/dist/shared/lib/router/utils/route-matcher"

export default function JobDetailPage({ params }: { params: Params }) {
  const id = params.id as string
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState<string[]>([])
  const [newRequirement, setNewRequirement] = useState("")
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getJobDetails = async () => {
      if (!isLoading && (!user || user.role !== "admin")) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const jobData = await fetchJob(id)
        setTitle(jobData.title)
        setCompany(jobData.company)
        setLocation(jobData.location)
        setDescription(jobData.description)
        setRequirements(jobData.requirements)
        setError(null)
      } catch (err) {
        console.error("Error fetching job:", err)
        setError("Failed to load job details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    getJobDetails()
  }, [id, user, isLoading, router])

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateJob(id, {
        title,
        company,
        location,
        description,
        requirements,
      })
      
      toast({
        title: "Job updated",
        description: "The job posting has been updated successfully.",
      })
    } catch (err) {
      console.error("Error updating job:", err)
      toast({
        title: "Update failed",
        description: "There was an error updating the job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Mock interview questions
  const interviewQuestions = [
    {
      id: "q1",
      question: "Can you tell me about your experience with React and TypeScript?",
      type: "technical",
      order: 1,
    },
    {
      id: "q2",
      question: "Describe a challenging project you worked on and how you approached it.",
      type: "behavioral",
      order: 2,
    },
    {
      id: "q3",
      question: "How do you handle state management in large React applications?",
      type: "technical",
      order: 3,
    },
    {
      id: "q4",
      question: "What is your approach to writing maintainable and scalable code?",
      type: "technical",
      order: 4,
    },
    {
      id: "q5",
      question: "How do you stay updated with the latest frontend technologies?",
      type: "behavioral",
      order: 5,
    },
  ]

  if (isLoading || !user || user.role !== "admin") {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <div className="max-w-4xl mx-auto flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </AuthProvider>
    )
  }

  if (error) {
    return (
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h3 className="text-xl font-medium mb-2 text-destructive">Error</h3>
                  <p className="text-muted-foreground text-center max-w-md">{error}</p>
                  <Button className="mt-4" asChild>
                    <Link href="/admin">Back to Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </AuthProvider>
    )
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
              <h1 className="text-3xl font-bold tracking-tight">Edit Job Posting</h1>
            </div>

            <Tabs defaultValue="details" className="space-y-6">
              <TabsList>
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="questions">Interview Questions</TabsTrigger>
                <TabsTrigger value="settings">AI Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Edit the basic details of this job posting</CardDescription>
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
                    <CardDescription>Add or remove job requirements</CardDescription>
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
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Questions</CardTitle>
                    <CardDescription>Manage questions for the AI interviewer to ask</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {interviewQuestions.map((question) => (
                      <div key={question.id} className="flex items-start justify-between p-3 border rounded-md">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Q{question.order}:</span>
                            <span>{question.question}</span>
                          </div>
                          <div className="mt-1">
                            <Badge variant="outline">{question.type}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Interviewer Settings</CardTitle>
                    <CardDescription>Configure how the AI interviewer behaves</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="personality">Interviewer Personality</Label>
                      <Input id="personality" defaultValue="Professional and friendly" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Interview Difficulty</Label>
                      <Input id="difficulty" type="range" min="1" max="5" defaultValue="3" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Target Duration (minutes)</Label>
                      <Input id="duration" type="number" defaultValue="30" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Toaster />
      </div>
    </AuthProvider>
  )
}
