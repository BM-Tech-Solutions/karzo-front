"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthProvider } from "@/lib/auth-context"
import { Textarea } from "@/components/ui/textarea"
import { fetchJobs } from "@/lib/api-service"
import { Job } from "@/lib/api-service"

export default function ApplyPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedJob, setSelectedJob] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  useEffect(() => {
    // Fetch real jobs from the API
    const getJobs = async () => {
      try {
        setLoadingJobs(true)
        const jobsData = await fetchJobs()
        setJobs(jobsData)
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoadingJobs(false)
      }
    }

    getJobs()

    // Pre-fill job from query parameter
    const jobId = searchParams.get("job")
    if (jobId) {
      setSelectedJob(jobId)
    }

    // Pre-fill user information if logged in
    if (user) {
      setName(user.full_name || "")
      setEmail(user.email)
      setPhone(user.phone || "")  // Already correctly using phone
      
      // Add state for resume URL
      if (user.resume_url) {
        // Set some indication that resume is already uploaded
        const resumeInfo = document.getElementById('resume-info');
        if (resumeInfo) {
          resumeInfo.textContent = `Current resume: ${user.resume_url.split('/').pop()}`;
        }
      }
    }
  }, [user, searchParams])

  // Update the handleSubmit function in your apply page
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedJob || !name || !email) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Get the resume file
      const resumeInput = document.getElementById('resume') as HTMLInputElement;
      const resumeFile = resumeInput.files?.[0];
      
      // Create form data for the API call
      const formData = new FormData();
      if (phone) formData.append('phone', phone);
      if (resumeFile) formData.append('resume', resumeFile);
      
      // Update the candidate profile
      if (user && (phone || resumeFile)) {
        const token = localStorage.getItem('karzo_token');
        await fetch(`http://localhost:8000/api/candidates/${user.id}/update-profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      }
      
      // Redirect to interview page
      router.push("/interview/room");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Apply for Position</h1>

            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>Complete the form below to apply for this position</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="job">Position</Label>
                    <Select value={selectedJob} onValueChange={setSelectedJob} required>
                      <SelectTrigger id="job">
                        <SelectValue placeholder={loadingJobs ? "Loading positions..." : "Select a position"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingJobs ? (
                          <SelectItem value="loading" disabled>Loading positions...</SelectItem>
                        ) : jobs.length > 0 ? (
                          jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id.toString()}>
                              {job.title} - {job.company}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No positions available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Tell us why you're interested in this position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume</Label>
                    <Input id="resume" type="file" />
                    <p className="text-sm text-muted-foreground">Upload your resume (PDF, DOC, or DOCX)</p>
                    {user?.resume_url && (
                      <p id="resume-info" className="text-sm text-green-600">
                        Current resume: {user.resume_url.split('/').pop()}
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!selectedJob || !name || !email || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </CardFooter>
            </Card>

            {selectedJob && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Position Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const job = jobs.find((job) => job.id.toString() === selectedJob)
                    if (!job) return null

                    return (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.company} • {job.location}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Description</h4>
                          <p className="text-sm mt-1">{job.description}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Requirements</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                            {job.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
