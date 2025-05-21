"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { mockInterviews, mockJobs } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Download, Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function InterviewHistoryPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div>Loading...</div>
  }

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

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Interview History</h1>
                <p className="text-muted-foreground">View and manage your past and upcoming interviews</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search interviews..." className="pl-8 w-[200px] md:w-[300px]" />
                </div>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Interviews</CardTitle>
                <CardDescription>All your scheduled and completed interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell className="font-medium">{getJobTitle(interview.jobId)}</TableCell>
                        <TableCell>{getCompany(interview.jobId)}</TableCell>
                        <TableCell>{formatDate(interview.scheduledFor)}</TableCell>
                        <TableCell>{interview.duration} min</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {interview.score ? (
                            <div className="flex items-center">
                              {interview.score}
                              <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {interview.status === "scheduled" ? (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/interview/prepare">Prepare</Link>
                              </Button>
                              <Button size="sm" asChild>
                                <Link href="/interview/room">Join</Link>
                              </Button>
                            </div>
                          ) : interview.status === "completed" ? (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/review">View Results</Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <a href="#" download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Performance</CardTitle>
                  <CardDescription>Your overall interview statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">85/100</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Interviews Completed</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Upcoming Interviews</p>
                      <p className="text-2xl font-bold">1</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                      <p className="text-2xl font-bold">100%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Areas</CardTitle>
                  <CardDescription>Based on your past interviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Response Time</p>
                        <p className="text-sm text-muted-foreground">
                          Try to be more concise in your answers while still being thorough
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Specific Examples</p>
                        <p className="text-sm text-muted-foreground">
                          Include more concrete examples from your past experience
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Interview Preparation</p>
                        <p className="text-sm text-muted-foreground">
                          Research the company more thoroughly before interviews
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
