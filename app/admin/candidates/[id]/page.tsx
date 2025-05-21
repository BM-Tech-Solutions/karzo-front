"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { mockCandidates, mockInterviews, mockJobs } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Download, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Define the correct type for the params
type CandidatePageProps = {
  params: {
    id: string
  }
}

export default function CandidateDetailPage({ params }: CandidatePageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Extract the id from params
  const candidateId = params.id

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Find the candidate
  const candidate = mockCandidates.find((c) => c.id === candidateId)
  if (!candidate) {
    return <div>Candidate not found</div>
  }

  // Get candidate's interviews
  const candidateInterviews = mockInterviews.filter((interview) => interview.candidateId === candidate.id)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  // Get job title by ID
  const getJobTitle = (jobId: string) => {
    const job = mockJobs.find((job) => job.id === jobId)
    return job ? job.title : "Unknown Position"
  }

  // Get company by job ID
  const getCompany = (jobId: string) => {
    const job = mockJobs.find((job) => job.id === jobId)
    return job ? job.company : "Unknown Company"
  }

  // Calculate average score
  const completedInterviews = candidateInterviews.filter((interview) => interview.status === "completed")
  const averageScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, interview) => sum + (interview.score || 0), 0) / completedInterviews.length,
        )
      : 0

  if (isLoading || !user || user.role !== "admin") {
    return <div>Loading...</div>
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Candidate Profile</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Candidate Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt={candidate.name} />
                        <AvatarFallback className="text-2xl">{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-medium text-lg mt-2">{candidate.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{candidate.phone}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download Resume
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-center">
                      <div className="text-3xl font-bold">{averageScore}</div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Technical Skills</span>
                          <span className="font-medium">85/100</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Communication</span>
                          <span className="font-medium">90/100</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Problem Solving</span>
                          <span className="font-medium">80/100</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Cultural Fit</span>
                          <span className="font-medium">85/100</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Tabs defaultValue="interviews" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="interviews">Interviews</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="interviews" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Interview History</CardTitle>
                        <CardDescription>All interviews for this candidate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {candidateInterviews.length > 0 ? (
                          <div className="space-y-4">
                            {candidateInterviews.map((interview) => (
                              <div
                                key={interview.id}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{getJobTitle(interview.jobId)}</h3>
                                    <Badge
                                      variant={
                                        interview.status === "completed"
                                          ? "success"
                                          : interview.status === "scheduled"
                                            ? "default"
                                            : "destructive"
                                      }
                                    >
                                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{getCompany(interview.jobId)}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(interview.scheduledFor)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {interview.score && (
                                    <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                                      Score: {interview.score}/100
                                    </div>
                                  )}
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/interviews/${interview.id}`}>View Details</Link>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No interviews found for this candidate.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Schedule New Interview</CardTitle>
                        <CardDescription>Set up a new interview for this candidate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {mockJobs.slice(0, 4).map((job) => (
                            <div key={job.id} className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                              <h3 className="font-medium">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {job.company} • {job.location}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">Posted: {job.postedDate}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recruiter Notes</CardTitle>
                        <CardDescription>Internal notes about this candidate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">Initial Screening</h3>
                              <span className="text-sm text-muted-foreground">May 10, 2023</span>
                            </div>
                            <p className="text-sm">
                              Candidate has a strong background in frontend development with 5 years of experience.
                              Currently working at XYZ Corp as a senior developer. Good communication skills and seems
                              enthusiastic about the role. Recommended for technical interview.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">- Sarah Johnson, Recruiter</p>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">Technical Assessment</h3>
                              <span className="text-sm text-muted-foreground">May 15, 2023</span>
                            </div>
                            <p className="text-sm">
                              Completed the coding challenge with excellent results. Demonstrated strong knowledge of
                              React, TypeScript, and state management. Code was well-structured and included proper
                              testing. Moving forward to the interview stage.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">- Michael Chen, Tech Lead</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Add Note</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <textarea
                          className="w-full min-h-[100px] p-2 border rounded-md"
                          placeholder="Add a new note about this candidate..."
                        ></textarea>
                        <div className="flex justify-end mt-2">
                          <Button>Save Note</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Candidate Timeline</CardTitle>
                        <CardDescription>History of interactions with this candidate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative border-l pl-6 pb-2 space-y-6">
                          <div className="relative">
                            <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border-4 border-primary bg-background"></div>
                            <div className="mb-1 flex items-baseline justify-between">
                              <h3 className="font-medium">Application Received</h3>
                              <span className="text-sm text-muted-foreground">May 5, 2023</span>
                            </div>
                            <p className="text-sm">
                              Candidate applied for the Frontend Developer position at TechCorp.
                            </p>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border-4 border-primary bg-background"></div>
                            <div className="mb-1 flex items-baseline justify-between">
                              <h3 className="font-medium">Resume Screened</h3>
                              <span className="text-sm text-muted-foreground">May 7, 2023</span>
                            </div>
                            <p className="text-sm">Resume reviewed and approved for next stage.</p>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border-4 border-primary bg-background"></div>
                            <div className="mb-1 flex items-baseline justify-between">
                              <h3 className="font-medium">Technical Assessment Sent</h3>
                              <span className="text-sm text-muted-foreground">May 10, 2023</span>
                            </div>
                            <p className="text-sm">Coding challenge sent to candidate via email.</p>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border-4 border-primary bg-background"></div>
                            <div className="mb-1 flex items-baseline justify-between">
                              <h3 className="font-medium">Technical Assessment Completed</h3>
                              <span className="text-sm text-muted-foreground">May 12, 2023</span>
                            </div>
                            <p className="text-sm">Candidate submitted coding challenge with excellent results.</p>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border-4 border-primary bg-background"></div>
                            <div className="mb-1 flex items-baseline justify-between">
                              <h3 className="font-medium">AI Interview Scheduled</h3>
                              <span className="text-sm text-muted-foreground">May 15, 2023</span>
                            </div>
                            <p className="text-sm">
                              Scheduled AI interview for Frontend Developer position at TechCorp.
                            </p>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border-4 border-primary bg-background"></div>
                            <div className="mb-1 flex items-baseline justify-between">
                              <h3 className="font-medium">AI Interview Completed</h3>
                              <span className="text-sm text-muted-foreground">May 15, 2023</span>
                            </div>
                            <p className="text-sm">
                              Candidate completed AI interview with a score of 85/100. Recommended for next round.
                            </p>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border-4 border-muted-foreground bg-background"></div>
                            <div className="mb-1 flex items-baseline justify-between">
                              <h3 className="font-medium">Team Interview Scheduled</h3>
                              <span className="text-sm text-muted-foreground">May 20, 2023</span>
                            </div>
                            <p className="text-sm">Scheduled for interview with the engineering team.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
