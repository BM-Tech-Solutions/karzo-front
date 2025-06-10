"use client"

import { useState, useEffect } from "react"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCompanyAuth, fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"

interface Interview {
  id: number
  candidate_name: string
  job_offer_title: string
  scheduled_date: string
  status: "scheduled" | "completed" | "cancelled"
}

export default function InterviewsPage() {
  const { company } = useCompanyAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchInterviews() {
      try {
        setIsLoading(true)
        // Fetch interviews from the backend API
        const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/interviews/company/`)
        if (response.ok) {
          const data = await response.json()
          setInterviews(data)
        } else {
          console.error("Failed to fetch interviews:", response.statusText)
        }
      } catch (error) {
        console.error("Failed to fetch interviews:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterviews()
  }, [])

  const sidebarItems = [
    {
      href: "/recruiter/dashboard",
      title: "Dashboard",
    },
    {
      href: "/recruiter/job-offers",
      title: "Job Offers",
    },
    {
      href: "/recruiter/candidates",
      title: "Candidates",
    },
    {
      href: "/recruiter/interviews",
      title: "Interviews",
    },
    {
      href: "/recruiter/invitations",
      title: "Invitations",
    },
  ]

  const filteredInterviews = interviews.filter(interview => 
    interview.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.job_offer_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen">
      <RecruiterSidebar items={sidebarItems} className="w-64" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Interviews</h1>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading interviews...</p>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No interviews found</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInterviews.map((interview) => (
                <Card key={interview.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{interview.candidate_name}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(interview.status)}`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Job Position</p>
                        <p className="font-medium">{interview.job_offer_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Scheduled Date</p>
                        <p className="font-medium">{formatDate(interview.scheduled_date)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" className="mr-2">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
