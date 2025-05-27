"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { User, FileText, Briefcase, Calendar, Clock } from "lucide-react"
import { fetchCandidateInterviews, Interview } from "@/lib/api-service"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loadingInterviews, setLoadingInterviews] = useState(false)

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

    // Update the fetchInterviews function in the useEffect hook
    
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

    fetchInterviews();
  }, [user, isLoading, router]);

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
                            <p className="text-sm text-muted-foreground">{interview.time}</p>
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
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
