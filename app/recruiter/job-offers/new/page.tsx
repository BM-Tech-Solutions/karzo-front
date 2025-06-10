"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCompanyAuth, fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { jobOfferSchema } from "@/lib/company-form-schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X } from "lucide-react"

// Define the type to match the schema exactly
type JobOfferFormValues = z.infer<typeof jobOfferSchema>

export default function NewJobOfferPage() {
  const { company } = useCompanyAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [newQuestion, setNewQuestion] = useState("")

  const form = useForm<JobOfferFormValues>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: [],
      questions: [], // Initialize with empty array even though it's optional
    },
  })

  const requirements = form.watch("requirements")
  const questions = form.watch("questions")

  const addRequirement = () => {
    if (newRequirement.trim() !== "") {
      form.setValue("requirements", [...requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    const updatedRequirements = [...requirements]
    updatedRequirements.splice(index, 1)
    form.setValue("requirements", updatedRequirements)
  }

  const addQuestion = () => {
    if (newQuestion.trim() !== "") {
      form.setValue("questions", [...(questions || []), newQuestion.trim()])
      setNewQuestion("")
    }
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...(questions || [])]
    updatedQuestions.splice(index, 1)
    form.setValue("questions", updatedQuestions)
  }

  const onSubmit = async (values: JobOfferFormValues) => {
    setError("")
    setSubmitting(true)

    try {
      // Use the correct job-offers endpoint
      const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/job-offers/`, {
        method: "POST",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to create job offer")
      }

      // Redirect to job offers page after successful creation
      router.push("/recruiter/job-offers")
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const sidebarItems = [
    {
      href: "/recruiter/dashboard",
      title: "Dashboard",
    },
    {
      href: "/recruiter/job-offers",
      title: "Job Offers",
    },
    {
      href: "/recruiter/candidates",
      title: "Candidates",
    },
    {
      href: "/recruiter/interviews",
      title: "Interviews",
    },
    {
      href: "/recruiter/invitations",
      title: "Invitations",
    },
  ]

  return (
    <div className="flex h-screen">
      <RecruiterSidebar items={sidebarItems} className="w-64" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Create New Job Offer</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Job Offer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the job position, responsibilities, and other details" 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Requirements</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a requirement"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addRequirement()
                          }
                        }}
                      />
                      <Button type="button" onClick={addRequirement}>
                        Add
                      </Button>
                    </div>
                    <div className="mt-2">
                      {requirements.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No requirements added yet</p>
                      ) : (
                        <div className="space-y-2">
                          {requirements.map((req, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between rounded-md border p-2"
                            >
                              <span className="text-sm">{req}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRequirement(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {form.formState.errors.requirements && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.requirements.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Screening Questions (Optional)</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a question for candidates"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addQuestion()
                          }
                        }}
                      />
                      <Button type="button" onClick={addQuestion}>
                        Add
                      </Button>
                    </div>
                    <div className="mt-2">
                      {(questions || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No questions added yet</p>
                      ) : (
                        <div className="space-y-2">
                          {(questions || []).map((q, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between rounded-md border p-2"
                            >
                              <span className="text-sm">{q}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {error && <div className="text-sm font-medium text-destructive">{error}</div>}

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/recruiter/job-offers")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Creating..." : "Create Job Offer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
