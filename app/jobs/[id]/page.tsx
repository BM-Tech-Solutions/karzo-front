"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { ArrowLeft, Building, Calendar, MapPin, Share2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { fetchJob, Job } from "@/lib/api-service"
import { format } from "date-fns"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getJob = async () => {
      try {
        setLoading(true)
        const data = await fetchJob(params.id)
        setJob(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching job:", err)
        setError("Failed to load job details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    getJob()
  }, [params.id])

  // Format date
  const formatPostedDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  if (loading) {
    return (
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <div className="max-w-4xl mx-auto flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </AuthProvider>
    )
  }

  if (error || !job) {
    return (
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h3 className="text-xl font-medium mb-2 text-destructive">Error</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {error || "Job not found"}
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/jobs">Back to Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/jobs">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Jobs
                </Link>
              </Button>
            </div>

            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Posted {formatPostedDate(job.posted_date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button asChild>
                      <Link href={`/apply?job=${job.id}`}>Apply Now</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Job Description</h3>
                  <p>{job.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-lg mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-lg mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge>React</Badge>
                    <Badge>TypeScript</Badge>
                    <Badge>JavaScript</Badge>
                    <Badge>HTML/CSS</Badge>
                    <Badge>Redux</Badge>
                    <Badge>REST APIs</Badge>
                    <Badge>Git</Badge>
                    <Badge>Responsive Design</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-lg mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Competitive salary and equity package</li>
                    <li>Health, dental, and vision insurance</li>
                    <li>Flexible work hours and remote work options</li>
                    <li>Professional development budget</li>
                    <li>Generous paid time off</li>
                    <li>401(k) matching</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/jobs">View Similar Jobs</Link>
                </Button>
                <Button asChild>
                  <Link href={`/apply?job=${job.id}`}>Apply Now</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About {job.company}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {job.company} is a leading technology company focused on building innovative solutions for businesses
                  and consumers. With a team of talented professionals, we're dedicated to creating products that make a
                  difference.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Company Size</h4>
                    <p className="text-muted-foreground">50-200 employees</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Industry</h4>
                    <p className="text-muted-foreground">Software & Technology</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Founded</h4>
                    <p className="text-muted-foreground">2015</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Website</h4>
                    <a href="#" className="text-primary hover:underline">
                      www.{job.company.toLowerCase().replace(/\s+/g, "")}.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
