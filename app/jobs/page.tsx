"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Building, Calendar } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchJobs, Job } from "@/lib/api-service"
import { format } from "date-fns"

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getJobs = async () => {
      try {
        setLoading(true)
        const data = await fetchJobs()
        setJobs(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching jobs:", err)
        setError("Failed to load jobs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    getJobs()
  }, [])

  // Filter jobs based on search term and location
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation =
      locationFilter === "all" || job.location.toLowerCase().includes(locationFilter.toLowerCase())

    return matchesSearch && matchesLocation
  })

  // Get unique locations for filter
  const locations = Array.from(new Set(jobs.map((job) => job.location)))

  // Format date
  const formatPostedDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Available Positions</h1>
                <p className="text-muted-foreground">Browse and apply for open positions</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <div className="md:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search jobs..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location.toLowerCase()}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Type</label>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <input type="checkbox" id="full-time" className="mr-2" />
                          <label htmlFor="full-time" className="text-sm">
                            Full-time
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="part-time" className="mr-2" />
                          <label htmlFor="part-time" className="text-sm">
                            Part-time
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="contract" className="mr-2" />
                          <label htmlFor="contract" className="text-sm">
                            Contract
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="remote" className="mr-2" />
                          <label htmlFor="remote" className="text-sm">
                            Remote
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSearchTerm("")
                        setLocationFilter("all")
                      }}
                    >
                      Reset Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-3 space-y-6">
                {loading ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <h3 className="text-xl font-medium mt-4">Loading jobs...</h3>
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <h3 className="text-xl font-medium mb-2 text-destructive">Error</h3>
                      <p className="text-muted-foreground text-center max-w-md">{error}</p>
                    </CardContent>
                  </Card>
                ) : filteredJobs && filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Building className="h-4 w-4 mr-1" />
                              {job.company}
                            </CardDescription>
                          </div>
                          <Badge>New</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            Posted {formatPostedDate(job.posted_date)}
                          </div>
                        </div>
                        <p className="text-sm mb-4">{job.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline">
                              {req.split(" ").slice(0, 3).join(" ")}
                              {req.split(" ").length > 3 ? "..." : ""}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline">+{job.requirements.length - 3} more</Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" asChild>
                          <Link href={`/jobs/${job.id}`}>View Details</Link>
                        </Button>
                        <Button asChild>
                          <Link href={`/apply?job=${job.id}`}>Apply Now</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">No jobs found</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        We couldn't find any jobs matching your search criteria. Try adjusting your filters or search
                        term.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
