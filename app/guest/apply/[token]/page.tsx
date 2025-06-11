"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { API_BASE_URL } from "@/lib/config"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface InvitationDetails {
  id: number
  token: string
  company_id: number
  company_name: string
  job_title?: string
  job_offer_id?: number
  status: string
  expires_at: string
  message?: string
  candidate_email: string
}

export default function GuestApplyPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) return
      
      try {
        setLoading(true)
        console.log(`Fetching invitation with token: ${token}`)
        const response = await fetch(`${API_BASE_URL}/api/invitations/token/${token}`)
        
        if (!response.ok) {
          console.log(`Error response status: ${response.status}`)
          
          // Try to get error details from response
          let errorDetail = "";
          try {
            const errorData = await response.json()
            errorDetail = errorData.detail || ""
            console.log("Error details:", errorData)
          } catch (e) {
            console.log("Could not parse error response as JSON")
          }
          
          if (response.status === 404) {
            throw new Error(`Invitation not found: ${errorDetail}`)
          } else if (response.status === 400) {
            throw new Error(`Invitation error: ${errorDetail}`)
          } else {
            throw new Error(`Failed to load invitation: ${errorDetail}`)
          }
        }
        
        const data = await response.json()
        console.log("Invitation data received:", data)
        setInvitation(data)
        
        // Pre-fill email from invitation
        if (data.candidate_email) {
          console.log(`Pre-filling email: ${data.candidate_email}`)
          setEmail(data.candidate_email)
        }
        
      } catch (err: any) {
        console.error("Error fetching invitation:", err)
        setError(err.message || "Failed to load invitation details")
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invitation || !name || !email) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create form data for the API call
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      if (phone) formData.append('phone', phone)
      if (coverLetter) formData.append('cover_letter', coverLetter)
      
      // Get the resume file
      const resumeInput = document.getElementById('resume') as HTMLInputElement
      const resumeFile = resumeInput.files?.[0]
      if (resumeFile) formData.append('resume', resumeFile)
      
      // Add invitation token
      formData.append('invitation_token', token)
      
      // Submit application
      const response = await fetch(`${API_BASE_URL}/api/applications/submit-with-token`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to submit application")
      }
      
      const applicationData = await response.json()
      
      // Store job information in localStorage for the interview flow
      if (invitation.job_offer_id) {
        localStorage.setItem('interview_job_id', invitation.job_offer_id.toString())
      }
      if (invitation.job_title) {
        localStorage.setItem('interview_job_title', invitation.job_title)
      }
      if (invitation.company_name) {
        localStorage.setItem('interview_company', invitation.company_name)
      }
      
      // Store application ID if returned
      if (applicationData.id) {
        localStorage.setItem('application_id', applicationData.id.toString())
      }
      
      // Store guest interview ID if returned
      if (applicationData.guest_interview_id) {
        console.log(`Storing guest interview ID: ${applicationData.guest_interview_id}`)
        localStorage.setItem('guest_interview_id', applicationData.guest_interview_id.toString())
      } else {
        console.log('No guest interview ID returned from the API')
      }
      
      // Clear any existing interview data
      localStorage.removeItem('interview_id')
      
      // Redirect to interview room
      router.push("/interview/room")
      
    } catch (error: any) {
      console.error("Error submitting application:", error)
      setError(error.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Loading invitation...</h2>
          </div>
        </main>
      </div>
    )
  }
  
  if (error || !invitation) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || "Invitation not found or has expired"}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </div>
        </main>
      </div>
    )
  }
  
  // Check if invitation has expired
  const isExpired = new Date(invitation.expires_at) < new Date()
  if (isExpired || invitation.status !== "pending") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invitation Expired</AlertTitle>
              <AlertDescription>
                This invitation has expired or has already been used.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Apply for Position</h1>
          
          {invitation.message && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Message from {invitation.company_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{invitation.message}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>
                Complete the form below to apply for 
                {invitation.job_title ? ` the ${invitation.job_title} position at ` : ' a position at '}
                {invitation.company_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={!!invitation.candidate_email}
                  />
                  {invitation.candidate_email && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Email address is pre-filled from your invitation
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
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
                  <p className="text-sm text-muted-foreground">
                    Upload your resume (PDF, DOC, or DOCX)
                  </p>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!name || !email || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
