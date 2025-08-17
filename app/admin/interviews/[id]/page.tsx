"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { mockInterviews, mockJobs, mockCandidates } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, User, Calendar, Clock, ArrowLeft, Play, Pause } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the correct type for the params
type InterviewDetailPageProps = {
  params: {
    id: string
  }
}

export default function InterviewDetailPage({ params }: InterviewDetailPageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [decision, setDecision] = useState("")

  // Extract the id from params
  const interviewId = params.id

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Find the interview
  const interview = mockInterviews.find((i) => i.id === interviewId)
  if (!interview) {
    return <div>Interview not found</div>
  }

  // Find the candidate
  const candidate = mockCandidates.find((c) => c.id === interview.candidateId)
  if (!candidate) {
    return <div>Candidate not found</div>
  }

  // Find the job
  const job = mockJobs.find((j) => j.id === interview.jobId)
  if (!job) {
    return <div>Job not found</div>
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Mock transcript data
  const transcript = [
    {
      speaker: "AI",
      text: "Hello and welcome to your interview for the Frontend Developer position at TechCorp. Could you please introduce yourself and tell me about your background in frontend development?",
      timestamp: "00:00",
    },
    {
      speaker: "Candidate",
      text: "Hi, my name is John Doe. I've been working as a frontend developer for about 5 years now. I started my career at a small startup where I built responsive web applications using React and TypeScript. Currently, I'm working at a mid-sized tech company where I lead the frontend team for our main product.",
      timestamp: "00:15",
    },
    {
      speaker: "AI",
      text: "That's great. Can you tell me about a challenging project you worked on recently and how you approached it?",
      timestamp: "00:45",
    },
    {
      speaker: "Candidate",
      text: "Sure. Recently, I led the redesign of our company's main dashboard which had performance issues and an outdated UI. The challenge was to improve performance while adding new features and maintaining backward compatibility for existing users.",
      timestamp: "01:00",
    },
    {
      speaker: "Candidate",
      text: "I approached this by first conducting a thorough analysis of the performance bottlenecks using Chrome DevTools and Lighthouse. We identified that we were re-rendering too many components unnecessarily and had some expensive calculations happening on each render.",
      timestamp: "01:20",
    },
    {
      speaker: "Candidate",
      text: "To solve this, I implemented React.memo for pure components, used useMemo and useCallback hooks to memoize expensive calculations and event handlers, and restructured our Redux store to minimize re-renders. We also moved to a code-splitting approach to reduce the initial bundle size.",
      timestamp: "01:40",
    },
  ]

  // Mock assessment data
  const assessment = {
    technicalSkills: 85,
    communication: 90,
    problemSolving: 80,
    culturalFit: 85,
    overallScore: 85,
    strengths: [
      "Strong technical knowledge of React and TypeScript",
      "Excellent communication skills",
      "Good problem-solving approach with real examples",
      "Experience leading frontend teams",
    ],
    areasForImprovement: [
      "Could provide more specific metrics on project outcomes",
      "Some hesitation when discussing system architecture",
      "Limited experience with newer frontend technologies mentioned in job description",
    ],
  }

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
              <h1 className="text-3xl font-bold tracking-tight">Interview Details</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{job.title}</CardTitle>
                        <CardDescription>{job.company}</CardDescription>
                      </div>
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
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Candidate</p>
                          <p className="text-sm text-muted-foreground">{candidate.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Date & Time</p>
                          <p className="text-sm text-muted-foreground">{formatDate(interview.scheduledFor)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Duration</p>
                          <p className="text-sm text-muted-foreground">{interview.duration} minutes</p>
                        </div>
                      </div>
                      {interview.score && (
                        <div className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {Math.round(interview.score / 10)}
                          </div>
                          <div>
                            <p className="font-medium">Score</p>
                            <p className="text-sm text-muted-foreground">{(interview.score / 20).toFixed(1)}/5</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="recording" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="recording">Recording</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="assessment">Assessment</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recording" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Interview Recording</CardTitle>
                        <CardDescription>Review the video recording of the interview</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-black rounded-md mb-4 flex items-center justify-center">
                          <div className="text-white text-center">
                            <p className="mb-2">Video recording placeholder</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/10 hover:bg-white/20 text-white"
                              onClick={togglePlayback}
                            >
                              {isPlaying ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" /> Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" /> Play
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(interview.duration * 60)}</span>
                          </div>
                          <Progress value={(currentTime / (interview.duration * 60)) * 100} className="h-2" />
                          <div className="flex justify-between">
                            <Button variant="outline" size="sm" onClick={togglePlayback}>
                              {isPlaying ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" /> Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" /> Play
                                </>
                              )}
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href="#" download>
                                <Download className="h-4 w-4 mr-2" /> Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="transcript" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Interview Transcript</CardTitle>
                        <CardDescription>Full transcript of the conversation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {transcript.map((entry, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="w-16 shrink-0 text-sm text-muted-foreground">{entry.timestamp}</div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {entry.speaker === "AI" ? "Interviewer" : candidate.name}
                                </p>
                                <p className="mt-1">{entry.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" asChild className="w-full">
                          <a href="#" download>
                            <Download className="h-4 w-4 mr-2" /> Download Transcript
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="assessment" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Assessment</CardTitle>
                        <CardDescription>Automated evaluation of the candidate's performance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label>Technical Skills</Label>
                              <span className="text-sm font-medium">{(assessment.technicalSkills / 20).toFixed(1)}/5</span>
                            </div>
                            <Progress value={assessment.technicalSkills} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label>Communication</Label>
                              <span className="text-sm font-medium">{(assessment.communication / 20).toFixed(1)}/5</span>
                            </div>
                            <Progress value={assessment.communication} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label>Problem Solving</Label>
                              <span className="text-sm font-medium">{(assessment.problemSolving / 20).toFixed(1)}/5</span>
                            </div>
                            <Progress value={assessment.problemSolving} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label>Cultural Fit</Label>
                              <span className="text-sm font-medium">{(assessment.culturalFit / 20).toFixed(1)}/5</span>
                            </div>
                            <Progress value={assessment.culturalFit} className="h-2" />
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="font-bold">Overall Score</Label>
                              <span className="text-sm font-bold">{(assessment.overallScore / 20).toFixed(1)}/5</span>
                            </div>
                            <Progress value={assessment.overallScore} className="h-3" />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h3 className="font-medium mb-2">Strengths</h3>
                            <ul className="space-y-1">
                              {assessment.strengths.map((strength, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <span className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">Areas for Improvement</h3>
                            <ul className="space-y-1">
                              {assessment.areasForImprovement.map((area, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                  <span>{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Candidate Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold mb-2">
                        {candidate.name.charAt(0)}
                      </div>
                      <h3 className="font-medium text-lg">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                          View Resume
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/admin/candidates/${candidate.id}`}>View Full Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hiring Decision</CardTitle>
                    <CardDescription>Provide feedback and make a decision</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedback">Feedback</Label>
                      <Textarea
                        id="feedback"
                        placeholder="Enter your feedback about this candidate..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="decision">Decision</Label>
                      <Select value={decision} onValueChange={setDecision}>
                        <SelectTrigger id="decision">
                          <SelectValue placeholder="Select decision" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="advance">Advance to Next Round</SelectItem>
                          <SelectItem value="hire">Extend Offer</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                          <SelectItem value="hold">Hold for Later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={!decision}>
                      Submit Decision
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
