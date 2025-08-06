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
  status: "applied" | "screening" | "interviewed" | "hired" | "rejected" | "passed" | "pending"
  applied_date: string | null
  interview_score?: number
  recruiter_id?: number
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
        // Fetch candidates from the backend API using the combined endpoint that includes guest candidates
        const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/company/candidates/`)
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched candidates data:", data) // Debug log to see what's coming from the API
          
          // Map the data to ensure consistent field names
          const normalizedCandidates = data.map((candidate: any) => {
            // Determine the correct name field
            const fullName = candidate.name || candidate.full_name || "Unknown";
            
            return {
              id: candidate.id,
              full_name: fullName,
              email: candidate.email || "",
              job_title: candidate.job_title || "Not specified",
              resume_url: candidate.resume_url || null,
              // Include pending status to show guest candidates
              status: candidate.status || "pending",
              applied_date: candidate.created_at || null
            };
          })
          
          console.log("Normalized candidates:", normalizedCandidates);
          
          // Show all candidates including pending ones
          setCandidates(normalizedCandidates)
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
      href: "/recruiter/reports",
      title: "Reports",
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
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
      case 'passed':
        return 'bg-emerald-100 text-emerald-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
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
            <h1 className="text-3xl font-bold">Passed Candidates</h1>
            <p className="text-muted-foreground">Candidates who passed interviews sent by you</p>
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

                      {candidate.interview_score !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground">Interview Score</p>
                          <p className="font-medium">{candidate.interview_score}/100</p>
                        </div>
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
