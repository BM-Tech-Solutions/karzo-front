"use client"

import { cn } from "@/lib/utils"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthProvider } from "@/lib/auth-context"
import { mockAdminStats, mockCandidates, mockInterviews, mockJobs } from "@/lib/mock-data"
import { Calendar, Clock, Download, Search, Users, Video } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "admin") {
    return <div>Loading...</div>
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
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
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage candidates, interviews, and job postings</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAdminStats.totalCandidates}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAdminStats.interviewsCompleted}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAdminStats.interviewsScheduled}</div>
                  <p className="text-xs text-muted-foreground">+4% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAdminStats.averageScore}/100</div>
                  <p className="text-xs text-muted-foreground">+2 points from last month</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="candidates" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="candidates">Candidates</TabsTrigger>
                  <TabsTrigger value="interviews">Interviews</TabsTrigger>
                  <TabsTrigger value="jobs">Job Postings</TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search..." className="w-[200px] pl-8 md:w-[300px]" />
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <TabsContent value="candidates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Candidates</CardTitle>
                    <CardDescription>Manage candidate profiles and interview status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Interviews</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockCandidates.map((candidate) => (
                          <TableRow key={candidate.id}>
                            <TableCell className="font-medium">{candidate.name}</TableCell>
                            <TableCell>{candidate.email}</TableCell>
                            <TableCell>{candidate.phone}</TableCell>
                            <TableCell>{candidate.interviews.length}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/candidates/${candidate.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Interviews</CardTitle>
                    <CardDescription>View and manage all scheduled and completed interviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockInterviews.map((interview) => {
                          const candidate = mockCandidates.find((c) => c.id === interview.candidateId)

                          return (
                            <TableRow key={interview.id}>
                              <TableCell className="font-medium">{candidate?.name || "Unknown"}</TableCell>
                              <TableCell>{getJobTitle(interview.jobId)}</TableCell>
                              <TableCell>{formatDate(interview.scheduledFor)}</TableCell>
                              <TableCell>
                                <div
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                    interview.status === "completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                      : interview.status === "scheduled"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                                  )}
                                >
                                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                </div>
                              </TableCell>
                              <TableCell>{interview.score ? `${interview.score}/100` : "-"}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/interviews/${interview.id}`}>View</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Postings</CardTitle>
                    <CardDescription>Manage job postings and interview questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Posted Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockJobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.company}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>{job.postedDate}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/jobs/${job.id}`}>Edit</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
