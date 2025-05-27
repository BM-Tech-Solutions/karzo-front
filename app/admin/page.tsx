"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAdminStats } from "@/lib/mock-data"
import { Calendar, Clock, Download, Plus, Search, Users, Video } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchJobs, fetchAllInterviews, Interview } from "@/lib/api-service"

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // --- State for candidates ---
  const [candidates, setCandidates] = useState<any[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(true)
  const [errorCandidates, setErrorCandidates] = useState<string | null>(null)
  
  // --- State for jobs ---
  const [jobs, setJobs] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [errorJobs, setErrorJobs] = useState<string | null>(null)
  
  // --- State for interviews ---
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loadingInterviews, setLoadingInterviews] = useState(true)
  const [errorInterviews, setErrorInterviews] = useState<string | null>(null)

  // --- Fetch candidates from API ---
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true)
      setErrorCandidates(null)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("karzo_token") : null
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/candidates`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error("Failed to fetch candidates")
        const data = await res.json()
        setCandidates(data)
      } catch (err: any) {
        setErrorCandidates(err.message || "Error loading candidates")
      } finally {
        setLoadingCandidates(false)
      }
    }
    fetchCandidates()
  }, [])

  // --- Fetch jobs from API ---
  useEffect(() => {
    const getJobs = async () => {
      if (!isLoading && (!user || user.role !== "admin")) {
        return
      }

      try {
        setLoadingJobs(true)
        setErrorJobs(null)
        const jobsData = await fetchJobs()
        setJobs(jobsData)
      } catch (error: any) {
        console.error("Error fetching jobs:", error)
        setErrorJobs(error.message || "Error loading jobs")
      } finally {
        setLoadingJobs(false)
      }
    }

    getJobs()
  }, [user, isLoading])
  
  // --- Fetch interviews from API ---
  useEffect(() => {
    const getInterviews = async () => {
      if (!isLoading && (!user || user.role !== "admin")) {
        return
      }

      try {
        setLoadingInterviews(true)
        setErrorInterviews(null)
        const interviewsData = await fetchAllInterviews()
        setInterviews(interviewsData)
      } catch (error: any) {
        console.error("Error fetching interviews:", error)
        setErrorInterviews(error.message || "Error loading interviews")
      } finally {
        setLoadingInterviews(false)
      }
    }

    getInterviews()
  }, [user, isLoading])

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
    const job = jobs.find((job) => job.id === jobId)
    return job ? job.title : "Unknown Position"
  }

  return (
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
                <Button asChild>
                  <Link href="/admin/jobs/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                  </Link>
                </Button>
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
                  {loadingCandidates ? (
                    <div>Loading candidates...</div>
                  ) : errorCandidates ? (
                    <div className="text-red-500">{errorCandidates}</div>
                  ) : (
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
                        {candidates.map((candidate) => (
                          <TableRow key={candidate.id}>
                            <TableCell className="font-medium">{candidate.full_name || candidate.email}</TableCell>
                            <TableCell>{candidate.email}</TableCell>
                            <TableCell>{candidate.phone || "-"}</TableCell>
                            <TableCell>{candidate.interviews ? candidate.interviews.length : 0}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/candidates/${candidate.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
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
                  {loadingInterviews ? (
                    <div>Loading interviews...</div>
                  ) : errorInterviews ? (
                    <div className="text-red-500">{errorInterviews}</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {interviews.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">No interviews found</TableCell>
                          </TableRow>
                        ) : (
                          interviews.map((interview) => (
                            <TableRow key={interview.id}>
                              <TableCell className="font-medium">{interview.candidate_name || interview.candidate_email || "Unknown"}</TableCell>
                              <TableCell>{interview.job_title || getJobTitle(interview.job_id.toString())}</TableCell>
                              <TableCell>{formatDate(interview.date)}</TableCell>
                              <TableCell>
                                <div className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                  interview.status === "completed" && "bg-green-100 text-green-800",
                                  interview.status === "scheduled" && "bg-blue-100 text-blue-800",
                                  interview.status === "cancelled" && "bg-red-100 text-red-800"
                                )}>
                                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/interviews/${interview.id}`}>View</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
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
                  {loadingJobs ? (
                    <div>Loading jobs...</div>
                  ) : errorJobs ? (
                    <div className="text-red-500">{errorJobs}</div>
                  ) : (
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
                        {jobs.length > 0 ? (
                          jobs.map((job) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.company}</TableCell>
                              <TableCell>{job.location}</TableCell>
                              <TableCell>{job.posted_date}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/jobs/${job.id}`}>Edit</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              <p className="text-muted-foreground mb-4">No jobs found</p>
                              <Button asChild>
                                <Link href="/admin/jobs/new">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Job
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
