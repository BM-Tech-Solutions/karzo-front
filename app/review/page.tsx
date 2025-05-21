"use client"

import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { CheckCircle, Download, Star } from "lucide-react"

export default function ReviewPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Mock interview results
  const interviewResults = {
    score: 85,
    duration: "28:45",
    jobTitle: "Frontend Developer",
    company: "TechCorp",
    feedback:
      "The candidate demonstrated strong technical knowledge and communication skills. They provided clear examples of past experience and showed enthusiasm for the role. Some areas for improvement include more specific details about project contributions and clearer articulation of career goals.",
    strengths: [
      "Technical knowledge of React and TypeScript",
      "Clear communication style",
      "Problem-solving approach",
      "Relevant project experience",
    ],
    improvements: [
      "More specific examples of individual contributions",
      "Clearer articulation of career goals",
      "More detailed responses to behavioral questions",
    ],
    nextSteps:
      "Your interview results have been sent to the hiring team at TechCorp. You should expect to hear back within 5-7 business days regarding next steps in the process.",
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
                        {interviewResults.strengths.map((strength, index) => (
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
                        {interviewResults.improvements.map((improvement, index) => (
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
