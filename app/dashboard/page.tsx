"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, fetchWithAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { mockInterviews, mockJobs } from "@/lib/mock-data"
import { Video } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      // Fetch admin data
      fetchWithAuth("/api/admin/data").then(/* ... */)
    } else if (user?.role === "candidate") {
      // Fetch candidate data
      fetchWithAuth("/api/candidate/data").then(/* ... */)
    }
  }, [user])

  if (isLoading || !user) {
    return <div>Loading...</div>
  }

  // Get completed interviews (past interviews)
  const completedInterviews = mockInterviews
    .filter((interview) => interview.status === "completed")
    .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.full_name}</h1>
            <p className="text-muted-foreground">View your interview history and browse available jobs</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Interview History</CardTitle>
                <CardDescription>Your past interviews</CardDescription>
              </CardHeader>
              <CardContent>
                {completedInterviews.length > 0 ? (
                  <div className="space-y-4">
                    {completedInterviews.map((interview) => (
                      <div key={interview.id} className="flex items-start space-x-4">
                        <div className="bg-green-500/10 p-2 rounded-md">
                          <Video className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{getJobTitle(interview.jobId)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(interview.scheduledFor)}</p>
                          {interview.score && <p className="text-sm font-medium">Score: {interview.score}/100</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No completed interviews yet.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/interviews/history">View All History</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Available Positions</CardTitle>
                <CardDescription>Jobs you can apply for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="space-y-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.company} • {job.location}
                      </p>
                      <p className="text-sm text-muted-foreground">Posted: {job.postedDate}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/jobs">Browse All Jobs</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Quick Apply</CardTitle>
                <CardDescription>Apply for a position now</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Ready to interview? Apply for a position and start your interview immediately.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/apply">Apply Now</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Prepare for Your Interview</CardTitle>
              <CardDescription>Tips to help you succeed in your AI interview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-medium">Before the Interview</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Test your camera and microphone</li>
                      <li>Find a quiet, well-lit space</li>
                      <li>Research the company and position</li>
                      <li>Prepare examples of your experience</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">During the Interview</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Speak clearly and at a moderate pace</li>
                      <li>Maintain eye contact with the camera</li>
                      <li>Use specific examples in your answers</li>
                      <li>Be concise but thorough</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/resources">View More Resources</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
