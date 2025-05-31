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
import { AlertCircle, Calendar, Clock, Download, FileText, Plus, RefreshCw, Search, Trash2, Users, Video, Loader2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { fetchJobs, fetchAllInterviews, Interview, deleteInterview, Report, fetchInterviewReport, fetchAllReports, deleteReport, deleteCandidate, generateReportFromTranscript, checkReportStatus } from "@/lib/api-service"
import { toast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { API_BASE_URL } from "@/lib/config"

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
  
  // --- State for reports ---
  const [reports, setReports] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [errorReports, setErrorReports] = useState<string | null>(null)
  const [processingReports, setProcessingReports] = useState<Record<number, boolean>>({})
  const [refreshingReports, setRefreshingReports] = useState(false)

  // --- Fetch candidates from API ---
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!isLoading && (!user || user.role !== "admin")) {
        return
      }
      
      setLoadingCandidates(true)
      setErrorCandidates(null)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("karzo_token") : null
        const res = await fetch(`${API_BASE_URL}/api/candidates`, {
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
  }, [user, isLoading])

  // --- Function to generate a report from a transcript ---
  const handleGenerateReport = async (reportId: number, conversationId: string | undefined) => {
    if (!conversationId) {
      toast({
        title: "Error",
        description: "No conversation ID available for this report.",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessingReports(prev => ({ ...prev, [reportId]: true }))
      
      const result = await generateReportFromTranscript(reportId, conversationId)
      
      toast({
        title: "Success",
        description: "Report generation started. This may take a few minutes.",
      })
      
      // Start polling for report status
      const checkInterval = setInterval(async () => {
        try {
          const statusResult = await checkReportStatus(reportId)
          
          if (statusResult.status === "complete") {
            clearInterval(checkInterval)
            setProcessingReports(prev => ({ ...prev, [reportId]: false }))
            
            // Refresh the reports list
            refreshReports()
            
            toast({
              title: "Report Complete",
              description: "The report has been successfully generated.",
            })
          }
        } catch (error) {
          console.error("Error checking report status:", error)
        }
      }, 10000) // Check every 10 seconds
      
      // Clear interval after 5 minutes to prevent infinite polling
      setTimeout(() => {
        clearInterval(checkInterval)
        setProcessingReports(prev => ({ ...prev, [reportId]: false }))
      }, 300000)
      
    } catch (error) {
      console.error("Error generating report:", error)
      setProcessingReports(prev => ({ ...prev, [reportId]: false }))
      
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  // --- Function to refresh reports ---
  const refreshReports = async () => {
    if (!user || user.role !== "admin") {
      return
    }
    
    try {
      setRefreshingReports(true)
      const data = await fetchAllReports()
      setReports(data)
      setErrorReports(null)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setErrorReports('Failed to fetch reports')
    } finally {
      setRefreshingReports(false)
    }
  }

  // --- Fetch reports from API ---
  useEffect(() => {
    const fetchReportsList = async () => {
      if (!isLoading && (!user || user.role !== "admin")) {
        return
      }
      
      try {
        setLoadingReports(true)
        const data = await fetchAllReports()
        setReports(data)
        setErrorReports(null)
      } catch (error) {
        console.error('Error fetching reports:', error)
        setErrorReports('Failed to fetch reports')
      } finally {
        setLoadingReports(false)
      }
    }
    
    fetchReportsList()
  }, [user, isLoading])
  
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
  
  // --- Fetch reports from API ---
  useEffect(() => {
    const getReports = async () => {
      if (!isLoading && (!user || user.role !== "admin")) {
        return
      }

      try {
        setLoadingReports(true)
        setErrorReports(null)
        
        // First get all completed interviews
        const interviewsData = await fetchAllInterviews()
        const completedInterviews = interviewsData.filter(interview => interview.status === "completed")
        
        // Then try to get reports for each completed interview, but don't fail if some don't have reports
        const reportsData = []
        for (const interview of completedInterviews) {
          try {
            const report = await fetchInterviewReport(interview.id)
            if (report) {
              reportsData.push(report)
            }
          } catch (err) {
            // Silently ignore missing reports
            console.log(`No report found for interview ${interview.id}`)
          }
        }
        
        setReports(reportsData)
      } catch (error: any) {
        console.error("Error fetching reports:", error)
        setErrorReports(error.message || "Error loading reports")
      } finally {
        setLoadingReports(false)
      }
    }

    getReports()
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
                <div className="text-2xl font-bold">{loadingCandidates ? "..." : candidates.length}</div>
                <p className="text-xs text-muted-foreground">Active candidates in system</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingJobs ? "..." : jobs.length}</div>
                <p className="text-xs text-muted-foreground">Active job listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingInterviews ? "..." : interviews.filter(interview => interview.status === "completed").length}</div>
                <p className="text-xs text-muted-foreground">Total completed interviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingReports ? "..." : reports.length}</div>
                <p className="text-xs text-muted-foreground">Generated interview reports</p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="candidates" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
                <TabsTrigger value="jobs">Job Postings</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
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
                            <TableCell>{interviews.filter(interview => interview.candidate_id === candidate.id).length}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/candidates/${candidate.id}`}>View</Link>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this candidate? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={async () => {
                                          try {
                                            await deleteCandidate(candidate.id);
                                            toast({
                                              title: "Candidate deleted",
                                              description: "The candidate has been successfully deleted."
                                            });
                                            // Refresh candidates list
                                            const updatedCandidates = candidates.filter(c => c.id !== candidate.id);
                                            setCandidates(updatedCandidates);
                                          } catch (error: any) {
                                            toast({
                                              title: "Error",
                                              description: error.message || "Failed to delete candidate",
                                              variant: "destructive"
                                            });
                                          }
                                        }}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
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
                                <div className="flex space-x-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Interview</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this interview? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={async () => {
                                            try {
                                              await deleteInterview(interview.id);
                                              toast({
                                                title: "Interview deleted",
                                                description: "The interview has been successfully deleted."
                                              });
                                              // Refresh interviews list
                                              const updatedInterviews = interviews.filter(i => i.id !== interview.id);
                                              setInterviews(updatedInterviews);
                                            } catch (error: any) {
                                              toast({
                                                title: "Error",
                                                description: error.message || "Failed to delete interview",
                                                variant: "destructive"
                                              });
                                            }
                                          }}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
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
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/jobs/${job.id}`}>Edit</Link>
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Job Offer</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this job offer? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={async () => {
                                            try {
                                              // Implement deleteJob functionality
                                              // await deleteJob(job.id);
                                              toast({
                                                title: "Job offer deleted",
                                                description: "The job offer has been successfully deleted."
                                              });
                                              // Refresh jobs list
                                              const updatedJobs = jobs.filter(j => j.id !== job.id);
                                              setJobs(updatedJobs);
                                            } catch (error: any) {
                                              toast({
                                                title: "Error",
                                                description: error.message || "Failed to delete job offer",
                                                variant: "destructive"
                                              });
                                            }
                                          }}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
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

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>View and manage interview reports and evaluations</CardDescription>
                  </div>
                  <Button onClick={refreshReports} disabled={refreshingReports} variant="outline" size="sm">
                    {refreshingReports ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingReports ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading reports...</span>
                    </div>
                  ) : errorReports ? (
                    <div className="text-red-500">{errorReports}</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Interview Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">No reports found</TableCell>
                          </TableRow>
                        ) : (
                          reports.map((report) => {
                            // Find the interview for this report
                            const interview = interviews.find(i => i.id === report.interview_id);
                            if (!interview) return null; // Skip if interview not found
                            
                            return (
                              <TableRow key={report.id}>
                                <TableCell className="font-medium">{interview.candidate_name || interview.candidate_email || "Unknown"}</TableCell>
                                <TableCell>{interview.job_title || getJobTitle(interview.job_id.toString())}</TableCell>
                                <TableCell>{formatDate(interview.date)}</TableCell>
                                <TableCell>
                                  {report.status === "processing" ? (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                      Processing
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                      Complete
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {report.status === "complete" ? report.score : "-"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    {report.status === "processing" ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleGenerateReport(report.id, report.conversation_id)}
                                        disabled={processingReports[report.id]}
                                      >
                                        {processingReports[report.id] ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                          </>
                                        ) : (
                                          <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Generate Report
                                          </>
                                        )}
                                      </Button>
                                    ) : null}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <FileText className="mr-2 h-4 w-4" />
                                          {report.status === "complete" ? "View Report" : "View Interview"}
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Interview {report.status === "complete" ? "Report" : "Details"}</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {report.status === "complete" ? (
                                              <div className="space-y-4 mt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                    <h3 className="font-medium text-sm">Candidate</h3>
                                                    <p>{interview.candidate_name || interview.candidate_email || "Unknown"}</p>
                                                  </div>
                                                  <div>
                                                    <h3 className="font-medium text-sm">Position</h3>
                                                    <p>{interview.job_title || getJobTitle(interview.job_id.toString())}</p>
                                                  </div>
                                                  <div>
                                                    <h3 className="font-medium text-sm">Interview Date</h3>
                                                    <p>{formatDate(interview.date)}</p>
                                                  </div>
                                                  <div>
                                                    <h3 className="font-medium text-sm">Duration</h3>
                                                    <p>{report?.duration || "Not recorded"}</p>
                                                  </div>
                                                </div>
                                                
                                                <div>
                                                  <h3 className="font-medium text-sm">Score</h3>
                                                  <div className="mt-1 flex items-center">
                                                    <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                                                      {report?.score || 0}/100
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                <div>
                                                  <h3 className="font-medium text-sm">Feedback</h3>
                                                  <p className="mt-1 text-sm">{report?.feedback || "No feedback provided"}</p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                    <h3 className="font-medium text-sm">Strengths</h3>
                                                    {report?.strengths && report.strengths.length > 0 ? (
                                                      <ul className="list-disc pl-5 mt-1 text-sm">
                                                        {report.strengths.map((strength, index) => (
                                                          <li key={index}>{strength}</li>
                                                        ))}
                                                      </ul>
                                                    ) : (
                                                      <p className="mt-1 text-sm">No strengths recorded</p>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <h3 className="font-medium text-sm">Areas for Improvement</h3>
                                                    {report?.improvements && report.improvements.length > 0 ? (
                                                      <ul className="list-disc pl-5 mt-1 text-sm">
                                                        {report.improvements.map((improvement, index) => (
                                                          <li key={index}>{improvement}</li>
                                                        ))}
                                                      </ul>
                                                    ) : (
                                                      <p className="mt-1 text-sm">No areas for improvement recorded</p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="py-8 text-center">
                                                <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                                                <h3 className="text-lg font-medium">No Report Available</h3>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                  This interview has been completed but no report has been generated yet.
                                                </p>
                                                <div className="mt-4">
                                                  <h4 className="font-medium">Interview Details</h4>
                                                  <div className="grid grid-cols-2 gap-4 mt-2">
                                                    <div>
                                                      <h3 className="font-medium text-sm">Candidate</h3>
                                                      <p>{interview.candidate_name || interview.candidate_email || "Unknown"}</p>
                                                    </div>
                                                    <div>
                                                      <h3 className="font-medium text-sm">Position</h3>
                                                      <p>{interview.job_title || getJobTitle(interview.job_id.toString())}</p>
                                                    </div>
                                                    <div>
                                                      <h3 className="font-medium text-sm">Interview Date</h3>
                                                      <p>{formatDate(interview.date)}</p>
                                                    </div>
                                                    <div>
                                                      <h3 className="font-medium text-sm">Status</h3>
                                                      <p className="capitalize">{interview.status}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Close</AlertDialogCancel>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    
                                    {report && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="destructive" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete this report? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={async () => {
                                                try {
                                                  await deleteReport(interview.id);
                                                  toast({
                                                    title: "Report deleted",
                                                    description: "The report has been successfully deleted."
                                                  });
                                                  // Refresh reports list by removing the deleted report
                                                  setReports(reports.filter(r => r && r.interview_id !== interview.id));
                                                } catch (error: any) {
                                                  toast({
                                                    title: "Error",
                                                    description: error.message || "Failed to delete report",
                                                    variant: "destructive"
                                                  });
                                                }
                                              }}
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
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
