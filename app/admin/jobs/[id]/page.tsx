"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { mockJobs } from "@/lib/mock-data"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
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

  const job = mockJobs.find((j) => j.id === id)

  useEffect(() => {
    if (job) {
      setTitle(job.title)
      setCompany(job.company)
      setLocation(job.location)
      setDescription(job.description)
      setRequirements(job.requirements)
    }
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router, job])

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Job updated",
        description: "The job posting has been updated successfully.",
      })
    }, 500)
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

  if (!job) {
    return <div>Job not found</div>
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
                    <CardTitle>Job Information</CardTitle>
                    <CardDescription>Edit the basic information for this job posting</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                    <CardDescription>Add or remove job requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={requirement} readOnly className="flex-1" />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRequirement(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a new requirement..."
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddRequirement()
                          }
                        }}
                      />
                      <Button onClick={handleAddRequirement}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} className="ml-auto">
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Questions</CardTitle>
                    <CardDescription>Customize the questions for the AI interviewer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {interviewQuestions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {question.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4 rotate-180" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Textarea defaultValue={question.question} className="mt-2" />
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Reset to Default</Button>
                    <Button onClick={handleSave}>Save Questions</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Interviewer Settings</CardTitle>
                    <CardDescription>Configure the behavior of the AI interviewer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="personality">AI Personality</Label>
                      <select id="personality" className="w-full p-2 border rounded-md" defaultValue="professional">
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="technical">Technical Expert</option>
                        <option value="challenging">Challenging</option>
                      </select>
                      <p className="text-sm text-muted-foreground">
                        Determines how the AI interviewer interacts with candidates
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="follow-up">Follow-up Questions</Label>
                      <select id="follow-up" className="w-full p-2 border rounded-md" defaultValue="medium">
                        <option value="none">None</option>
                        <option value="light">Light (1-2 follow-ups)</option>
                        <option value="medium">Medium (2-3 follow-ups)</option>
                        <option value="deep">Deep (3-5 follow-ups)</option>
                      </select>
                      <p className="text-sm text-muted-foreground">
                        Controls how many follow-up questions the AI will ask based on candidate responses
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Target Interview Duration</Label>
                      <select id="duration" className="w-full p-2 border rounded-md" defaultValue="30">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                      </select>
                      <p className="text-sm text-muted-foreground">
                        The AI will adjust question depth to target this duration
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="intro">Custom Introduction</Label>
                      <Textarea
                        id="intro"
                        placeholder="Enter a custom introduction for the AI interviewer..."
                        className="min-h-[100px]"
                        defaultValue="Hello! I'm the AI interviewer for the Frontend Developer position at TechCorp. I'll be asking you a series of questions to learn more about your experience and skills. Let's get started!"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} className="ml-auto">
                      Save Settings
                    </Button>
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
