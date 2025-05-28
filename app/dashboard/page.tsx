"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { User, FileText, Briefcase, Calendar, Clock, BarChart, Star, CheckCircle, X } from "lucide-react"
import { fetchCandidateInterviews, Interview, fetchCandidateReports, Report } from "@/lib/api-service"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loadingInterviews, setLoadingInterviews] = useState(false)
  const [loadingReports, setLoadingReports] = useState(false)
  const [activeTab, setActiveTab] = useState<'interviews' | 'reports'>('interviews');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  // Add this new state to store the mapped reports with job titles
  const [reportsWithJobTitles, setReportsWithJobTitles] = useState<(Report & { job_title?: string })[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }
    
    // Redirect admin users to the admin dashboard
    if (!isLoading && user && user.role === "admin") {
      router.push("/admin")
      return
    }

    // Fetch interview history
    const fetchInterviews = async () => {
      if (!user) return;
      
      setLoadingInterviews(true);
      try {
        // Convert user.id to a number
        const interviewsData = await fetchCandidateInterviews(Number(user.id));
        setInterviews(interviewsData);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoadingInterviews(false);
      }
    };

    // Fetch candidate reports
    const fetchReports = async () => {
      if (!user) return;
      
      setLoadingReports(true);
      try {
        // Convert user.id to a number
        const reportsData = await fetchCandidateReports(Number(user.id));
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchInterviews();
    fetchReports();
  }, [user, isLoading, router]);

  // Add this new useEffect to map job titles to reports
  useEffect(() => {
    if (reports.length > 0 && interviews.length > 0) {
      // Create a map of interview_id to job_title for quick lookup
      const interviewMap = new Map<number, string>();
      interviews.forEach(interview => {
        interviewMap.set(interview.id, interview.job_title);
      });
      
      // Map the reports with job titles
      const mappedReports = reports.map(report => ({
        ...report,
        job_title: interviewMap.get(report.interview_id) || "N/A"
      }));
      
      setReportsWithJobTitles(mappedReports);
    } else {
      setReportsWithJobTitles(reports);
    }
  }, [reports, interviews]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.full_name || "Candidate"}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <User className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Manage your personal information</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/profile">View Profile</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Job Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Briefcase className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Browse available positions</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-4 border-b">
              <button
                className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === 'interviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setActiveTab('interviews')}
              >
                Interviews
              </button>
              <button
                className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
            </div>

            {/* Rest of your component remains the same */}
            {activeTab === 'interviews' && (
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Interview History</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Interviews</CardTitle>
                    <CardDescription>View your past and upcoming interviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingInterviews ? (
                      <p>Loading interviews...</p>
                    ) : interviews.length > 0 ? (
                      <div className="space-y-4">
                        {interviews.map((interview) => (
                          <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Calendar className="h-10 w-10 text-primary" />
                              <div>
                                <h3 className="font-medium">{interview.job_title}</h3>
                                <p className="text-sm text-muted-foreground">{interview.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="font-medium">{interview.date}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(interview.date), "MMM d, yyyy h:mm a")}</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                interview.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                              </div>
                              {interview.status === 'scheduled' && (
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/interview/prepare?id=${interview.id}`}>Prepare</Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No interviews yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          You haven't participated in any interviews yet.
                        </p>
                        <Button asChild>
                          <Link href="/jobs">Apply for Jobs</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
            
            {/* Reports tab content */}
            {activeTab === 'reports' && (
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Interview Reports</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Reports</CardTitle>
                    <CardDescription>View your interview performance reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingReports ? (
                      <p>Loading reports...</p>
                    ) : reportsWithJobTitles.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableCaption>A list of your interview reports</TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Report ID</TableHead>
                              <TableHead>Interview ID</TableHead>
                              <TableHead>Candidate Name</TableHead>
                              <TableHead>Job Title</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportsWithJobTitles.map((report) => (
                              <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.id}</TableCell>
                                <TableCell>{report.interview_id}</TableCell>
                                <TableCell>{user?.full_name || "Candidate"}</TableCell>
                                <TableCell>{report.job_title || "N/A"}</TableCell>
                                <TableCell>{format(new Date(report.created_at), "MMM d, yyyy")}</TableCell>
                                <TableCell className="text-right">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setSelectedReport(report)}
                                      >
                                        View
                                      </Button>
                                    </DialogTrigger>
                                    {/* Dialog content remains the same */}
                                    <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center justify-between">
                                          <span>Report Details</span>
                                          <DialogClose className="rounded-full hover:bg-muted p-1">
                                            <X className="h-4 w-4" />
                                          </DialogClose>
                                        </DialogTitle>
                                        <DialogDescription>
                                          Interview Report #{report.id}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm font-medium">Score:</p>
                                            <p className="text-sm">{report.score ?? 'N/A'}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">Duration:</p>
                                            <p className="text-sm">{report.duration ?? 'N/A'}</p>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <p className="text-sm font-medium mb-1">Feedback:</p>
                                          <p className="text-sm text-muted-foreground border p-2 rounded-md bg-muted/50">
                                            {report.feedback || 'No feedback provided.'}
                                          </p>
                                        </div>
                                        
                                        <div>
                                          <p className="text-sm font-medium mb-1">Strengths:</p>
                                          <ul className="list-disc list-inside text-sm text-muted-foreground border p-2 rounded-md bg-muted/50">
                                            {report.strengths && report.strengths.length > 0 ? (
                                              report.strengths.map((s, idx) => <li key={idx}>{s}</li>)
                                            ) : (
                                              <li>No strengths listed.</li>
                                            )}
                                          </ul>
                                        </div>
                                        
                                        <div>
                                          <p className="text-sm font-medium mb-1">Improvements:</p>
                                          <ul className="list-disc list-inside text-sm text-muted-foreground border p-2 rounded-md bg-muted/50">
                                            {report.improvements && report.improvements.length > 0 ? (
                                              report.improvements.map((i, idx) => <li key={idx}>{i}</li>)
                                            ) : (
                                              <li>No improvements listed.</li>
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          You haven't received any reports yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}

