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
        
        // Check if we already have a report for this interview
        if (interviewId) {
          try {
            const existingReport = await fetchInterviewReport(parseInt(interviewId))
            if (existingReport) {
              setInterviewResults({
                score: existingReport.score || 0,
                duration: existingReport.duration || "N/A",
                jobTitle: localStorage.getItem('job_title') || "N/A",
                company: localStorage.getItem('company') || "N/A",
                feedback: existingReport.feedback || "No feedback available yet.",
                strengths: existingReport.strengths || [],
                improvements: existingReport.improvements || [],
                nextSteps: "Your interview results have been recorded. You may be contacted for next steps in the hiring process.",
              })
              setLoading(false)
              return
            }
          } catch (error) {
            // Report doesn't exist yet, continue with normal flow
            console.log('No existing report found, will create one')
          }
        }
        
        if (!interviewId) {
          // If no interview ID is found, try to fetch the most recent interview for the user
          if (user && user.id) {
            const token = localStorage.getItem('karzo_token')
            const recentResponse = await fetch(`http://localhost:8000/api/interviews/candidates/${user.id}?limit=1`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (recentResponse.ok) {
              const recentInterviews = await recentResponse.json()
              
              if (recentInterviews && recentInterviews.length > 0) {
                // Use the most recent interview
                const mostRecentInterview = recentInterviews[0]
                
                // Fetch job details if needed
                let jobTitle = mostRecentInterview.job_title
                let company = mostRecentInterview.company
                
                if (!jobTitle || !company) {
                  try {
                    const token = localStorage.getItem('karzo_token')
                    const jobResponse = await fetch(`http://localhost:8000/api/jobs/${mostRecentInterview.job_id}`, {
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
                let strengths = []
                let improvements = []
                
                try {
                  if (mostRecentInterview.strengths && typeof mostRecentInterview.strengths === 'string') {
                    strengths = JSON.parse(mostRecentInterview.strengths)
                  } else if (Array.isArray(mostRecentInterview.strengths)) {
                    strengths = mostRecentInterview.strengths
                  }
                  
                  if (mostRecentInterview.improvements && typeof mostRecentInterview.improvements === 'string') {
                    improvements = JSON.parse(mostRecentInterview.improvements)
                  } else if (Array.isArray(mostRecentInterview.improvements)) {
                    improvements = mostRecentInterview.improvements
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
                  score: mostRecentInterview.score || 0,
                  duration: mostRecentInterview.duration || "N/A",
                  jobTitle: jobTitle || "N/A",
                  company: company || "N/A",
                  feedback: mostRecentInterview.feedback || "No feedback available yet.",
                  strengths: strengths,
                  improvements: improvements,
                  nextSteps: "Your interview results have been recorded. You may be contacted for next steps in the hiring process.",
                };
                
                setInterviewResults(resultsData);
                
                // Create a report for this interview
                try {
                  const reportData: ReportCreate = {
                    interview_id: mostRecentInterview.id,
                    candidate_id: user?.id ? (typeof user.id === 'string' ? parseInt(user.id) : user.id) : 0, // Convert string ID to number
                    score: typeof resultsData.score === 'string' ? parseInt(resultsData.score) : resultsData.score, // Ensure number
                    duration: resultsData.duration,
                    feedback: resultsData.feedback,
                    strengths: resultsData.strengths,
                    improvements: resultsData.improvements
                  };
                  
                  await createReport(reportData);
                  console.log('Successfully created report for interview', mostRecentInterview.id);
                } catch (reportError) {
                  console.error('Error creating report:', reportError);
                }
                
                setLoading(false);
                return;
              }
            }
            
            // If no recent interviews found, redirect to dashboard
            router.push('/dashboard');
            return;
          }
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
        let strengths = []
        let improvements = []
        
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
          
          const reportData: ReportCreate = {
            interview_id: parseInt(interviewId),
            candidate_id: typeof user.id === 'string' ? parseInt(user.id) : user.id, // Convert string ID to number
            score: typeof resultsData.score === 'string' ? parseInt(resultsData.score) : resultsData.score, // Ensure number
            duration: resultsData.duration,
            feedback: resultsData.feedback,
            strengths: resultsData.strengths,
            improvements: resultsData.improvements
          };
          
          await createReport(reportData);
          console.log('Successfully created report for interview', interviewId);
        } catch (reportError) {
          console.error('Error creating report:', reportError);
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
                      <div className="text-xl font-medium">{interviewResults.duration}</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Feedback</h3>
                    <p className="text-sm">{interviewResults.feedback}</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 mt-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Strengths</h3>
                      <ul className="space-y-1">
                        {interviewResults.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-sm flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Areas for Improvement</h3>
                      <ul className="space-y-1">
                        {interviewResults.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="h-4 w-4 rounded-full bg-muted-foreground mr-2 mt-0.5 shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{interviewResults.nextSteps}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <a href="#" download>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </a>
                  </Button>
                  <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
