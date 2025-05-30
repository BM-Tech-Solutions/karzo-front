"use client"

import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { CheckCircle, Download, Star } from "lucide-react"
import { useEffect, useState } from 'react'
import { createReport, fetchInterviewReport, ReportCreate } from "@/lib/api-service"

// Define interface for interview results
interface InterviewResults {
  score: number;
  duration: string;
  jobTitle: string;
  company: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string;
  isProcessing?: boolean;
  reportId?: number;
  conversationId?: string;
}

export default function ReviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [interviewResults, setInterviewResults] = useState<InterviewResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        // Get the interview ID from localStorage
        const interviewId = localStorage.getItem('interview_id')
        
        // Log the interview ID for debugging
        console.log('Review page - Interview ID from localStorage:', interviewId)
        
        if (!interviewId) {
          // If no interview ID is found, redirect back to dashboard
          console.log('No interview ID found in localStorage, redirecting to dashboard')
          router.push('/dashboard')
          return
        }
        
        // Check if we already have a report for this interview
        try {
          console.log('Checking if report exists for interview ID:', interviewId)
          const existingReport = await fetchInterviewReport(parseInt(interviewId))
          
          if (existingReport) {
            console.log('Report already exists for interview', interviewId)
            
            // Check if the report is still processing
            if (existingReport.status === "processing") {
              console.log('Report is still processing')
              setInterviewResults({
                score: 0,
                duration: existingReport.duration || "N/A",
                jobTitle: localStorage.getItem('job_title') || "N/A",
                company: localStorage.getItem('company') || "N/A",
                feedback: "Your interview is being processed. Please check back later for your full results.",
                strengths: [],
                improvements: [],
                nextSteps: "Your interview has been recorded and is currently being analyzed. This process may take a few minutes. You will receive an email when your results are ready.",
                isProcessing: true,
                reportId: existingReport.id,
                conversationId: existingReport.conversation_id
              })
            } else {
              // Report is complete
              setInterviewResults({
                score: existingReport.score || 0,
                duration: existingReport.duration || "N/A",
                jobTitle: localStorage.getItem('job_title') || "N/A",
                company: localStorage.getItem('company') || "N/A",
                feedback: existingReport.feedback || "No feedback available yet.",
                strengths: existingReport.strengths || [],
                improvements: existingReport.improvements || [],
                nextSteps: "Your interview results have been recorded. You may be contacted for next steps in the hiring process.",
                isProcessing: false,
                reportId: existingReport.id,
                conversationId: existingReport.conversation_id
              })
            }
            setLoading(false)
            return
          }
        } catch (error) {
          // Report doesn't exist yet, continue with normal flow
          console.log('No existing report found, will create one for interview ID:', interviewId)
        }
        
        // Fetch the interview data from the API
        const token = localStorage.getItem('karzo_token')
        const response = await fetch(`http://localhost:8000/api/interviews/${interviewId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch interview data')
        }
        
        const data = await response.json()
        console.log('Fetched interview data:', data)
        
        // Fetch job details if needed
        let jobTitle = data.job_title
        let company = data.company
        
        if (!jobTitle || !company) {
          try {
            const token = localStorage.getItem('karzo_token')
            const jobResponse = await fetch(`http://localhost:8000/api/jobs/${data.job_id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            if (jobResponse.ok) {
              const jobData = await jobResponse.json()
              jobTitle = jobData.title
              company = jobData.company
            }
          } catch (jobError) {
            console.error('Error fetching job details:', jobError)
          }
        }
        
        // Parse strengths and improvements if they're stored as JSON strings
        let strengths: string[] = []
        let improvements: string[] = []
        
        try {
          if (data.strengths && typeof data.strengths === 'string') {
            strengths = JSON.parse(data.strengths)
          } else if (Array.isArray(data.strengths)) {
            strengths = data.strengths
          }
          
          if (data.improvements && typeof data.improvements === 'string') {
            improvements = JSON.parse(data.improvements)
          } else if (Array.isArray(data.improvements)) {
            improvements = data.improvements
          }
        } catch (parseError) {
          console.error('Error parsing strengths/improvements:', parseError)
        }
        
        // If no strengths/improvements are available, provide defaults
        if (strengths.length === 0) {
          strengths = [
            "Technical knowledge",
            "Communication skills",
            "Problem-solving approach"
          ]
        }
        
        if (improvements.length === 0) {
          improvements = [
            "Provide more specific examples",
            "Articulate career goals more clearly"
          ]
        }
        
        const resultsData = {
          score: data.score || 0,
          duration: data.duration || "N/A",
          jobTitle: jobTitle || "N/A",
          company: company || "N/A",
          feedback: data.feedback || "No feedback available yet.",
          strengths: strengths,
          improvements: improvements,
          nextSteps: "Your interview results have been recorded. You may be contacted for next steps in the hiring process.",
        };
        
        // Transform the data to match the expected format
        setInterviewResults(resultsData);
        
        // Store job title and company in localStorage for future reference
        if (jobTitle) localStorage.setItem('job_title', jobTitle);
        if (company) localStorage.setItem('company', company);
        
        // Create a report for this interview
        try {
          if (!interviewId || !user) {
            throw new Error('Missing interview ID or user');
          }
          
          // Log job and user details for debugging
          console.log('Job details:', {
            jobTitle: jobTitle || 'N/A',
            company: company || 'N/A',
            jobId: data.job_id || 'N/A'
          });
          
          console.log('User details:', {
            userId: user?.id || 'N/A',
            userName: user?.full_name || 'N/A',
            userRole: user?.role || 'N/A'
          });
          
          // Get the ElevenLabs conversation ID from localStorage
          const conversationId = localStorage.getItem('conversation_id');
          
          const reportData: ReportCreate = {
            interview_id: parseInt(interviewId),
            candidate_id: user?.id ? (typeof user.id === 'string' ? parseInt(user.id) : user.id) : 0,
            score: typeof resultsData.score === 'string' ? parseInt(resultsData.score as string) : resultsData.score,
            duration: resultsData.duration,
            feedback: resultsData.feedback,
            strengths: resultsData.strengths,
            improvements: resultsData.improvements,
            status: "processing",
            conversation_id: conversationId || undefined
          };
          
          // Log the complete report data for debugging
          console.log('Creating report with data:', JSON.stringify(reportData, null, 2));
          
          await createReport(reportData);
          console.log('Successfully created report for interview', interviewId);
        } catch (reportError: any) {
          // Check if the error is because a report already exists
          if (reportError instanceof Error && reportError.message.includes('already exists')) {
            console.log('A report already exists for this interview');
            // Continue with the normal flow, the error is expected
          } else {
            console.error('Error creating report:', reportError);
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching interview data:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
        setLoading(false)
      }
    }
    
    fetchInterviewData()
  }, [user, router])

  if (loading) {
    return (
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <div className="max-w-3xl mx-auto text-center">
              <p>Loading interview results...</p>
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
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-red-500">Error: {error}</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">
                Return to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </AuthProvider>
    )
  }

  if (!interviewResults) {
    return (
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <div className="max-w-3xl mx-auto text-center">
              <p>No interview results available</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">
                Return to Dashboard
              </Button>
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
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Interview Completed</h1>
              <p className="text-muted-foreground mt-2">
                Thank you for completing your interview for {interviewResults.jobTitle} at {interviewResults.company}
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                {interviewResults.isProcessing ? (
                  <>
                    <CardHeader>
                      <CardTitle>Thank You!</CardTitle>
                      <CardDescription>Your interview has been successfully recorded</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4">
                          <CheckCircle className="h-10 w-10 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-medium mb-4">Your Report is Being Generated</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Thank you for completing your interview. Your responses are being analyzed and a detailed report is being prepared.
                      </p>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        This process may take a few minutes. You can check back later in your dashboard to view your complete results.
                      </p>
                    </CardContent>
                    <CardFooter className="justify-center">
                      <Button onClick={() => router.push('/dashboard')}>
                        Return to Dashboard
                      </Button>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <CardHeader>
                      <CardTitle>Interview Summary</CardTitle>
                      <CardDescription>Overview of your interview performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
                          <div className="text-4xl font-bold text-primary">{interviewResults.score}</div>
                          <div className="text-sm text-muted-foreground">Overall Score</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-5 w-5",
                                  star <= Math.round(interviewResults.score / 20)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground",
                                )}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Rating</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                          <div className="text-lg font-medium">{interviewResults.duration}</div>
                          <div className="text-sm text-muted-foreground">Duration</div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Feedback</h3>
                        <p className="text-muted-foreground">{interviewResults.feedback}</p>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2 mt-8">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Strengths</h3>
                          <ul className="space-y-2">
                            {interviewResults.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-4">Areas for Improvement</h3>
                          <ul className="space-y-2">
                            {interviewResults.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start">
                                <div className="h-5 w-5 rounded-full border-2 border-amber-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                </div>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Next Steps</h3>
                        <p className="text-muted-foreground">{interviewResults.nextSteps}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        Return to Dashboard
                      </Button>
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}