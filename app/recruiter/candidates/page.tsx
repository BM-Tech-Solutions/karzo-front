"use client"

import { useState, useEffect } from "react"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCompanyAuth, fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"

interface Candidate {
  id: number
  full_name: string
  email: string
  job_title: string
  resume_url?: string
  status: "applied" | "screening" | "interviewed" | "hired" | "rejected"
  applied_date: string
}

export default function CandidatesPage() {
  const { company } = useCompanyAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setIsLoading(true)
        // Fetch candidates from the backend API
        const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/company/candidates/`)
        if (response.ok) {
          const data = await response.json()
          setCandidates(data)
        } else {
          console.error("Failed to fetch candidates:", response.statusText)
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCandidates()
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

  const filteredCandidates = candidates.filter(candidate => 
    candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'screening':
        return 'bg-yellow-100 text-yellow-800'
      case 'interviewed':
        return 'bg-purple-100 text-purple-800'
      case 'hired':
        return 'bg-green-100 text-green-800'
      case 'rejected':
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
            <h1 className="text-3xl font-bold">Candidates</h1>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No candidates found</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{candidate.full_name}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(candidate.status)}`}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{candidate.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Applied for</p>
                        <p className="font-medium">{candidate.job_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Applied on</p>
                        <p className="font-medium">{formatDate(candidate.applied_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Resume</p>
                        {candidate.resume_url ? (
                          <a 
                            href={candidate.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Resume
                          </a>
                        ) : (
                          <p>No resume available</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        Schedule Interview
                      </Button>
                      {candidate.status !== "hired" && candidate.status !== "rejected" && (
                        <>
                          <Button variant="outline" size="sm" className="text-green-500 hover:text-green-700">
                            Hire
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                            Reject
                          </Button>
                        </>
                      )}
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
