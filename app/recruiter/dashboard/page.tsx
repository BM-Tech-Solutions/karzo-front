"use client"

import { useEffect, useState } from "react"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCompanyAuth } from "@/lib/company-auth-context"
import { fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"

export default function RecruiterDashboard() {
  const { company } = useCompanyAuth()
  const [stats, setStats] = useState({
    totalJobOffers: 0,
    activeJobOffers: 0,
    totalCandidates: 0,
    totalInterviews: 0,
  })
  const [upcomingInterviews, setUpcomingInterviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch dashboard stats
        const statsResponse = await fetchWithCompanyAuth(`${API_BASE_URL}/api/company/dashboard-stats`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats({
            totalJobOffers: statsData.totalJobOffers || 0,
            activeJobOffers: statsData.activeJobOffers || 0,
            totalCandidates: statsData.totalCandidates || 0,
            totalInterviews: statsData.totalInterviews || 0,
          })
        } else {
          console.error("Failed to fetch dashboard stats:", statsResponse.statusText)
        }
        
        // Fetch upcoming interviews (only pending status)
        const interviewsResponse = await fetchWithCompanyAuth(`${API_BASE_URL}/api/company/interviews`)
        if (interviewsResponse.ok) {
          const interviewsData = await interviewsResponse.json()
          // Filter only pending interviews
          const pendingInterviews = interviewsData.filter((interview: any) => interview.status === 'pending')
          setUpcomingInterviews(pendingInterviews.slice(0, 5)) // Show max 5 upcoming interviews
        } else {
          console.error("Failed to fetch upcoming interviews:", interviewsResponse.statusText)
        }

        // Fetch current company to get api_key
        const meResponse = await fetchWithCompanyAuth(`${API_BASE_URL}/api/company/me`)
        if (meResponse.ok) {
          const me = await meResponse.json()
          setApiKey(me.api_key || null)
          // Sync localStorage company object with latest api_key
          if (typeof window !== 'undefined') {
            try {
              const stored = localStorage.getItem('karzo_company')
              if (stored) {
                const parsed = JSON.parse(stored)
                parsed.api_key = me.api_key || null
                localStorage.setItem('karzo_company', JSON.stringify(parsed))
              }
            } catch (e) {
              console.error('Failed to sync api_key to localStorage company:', e)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  async function handleGenerateApiKey() {
    setIsGenerating(true)
    setCopied(false)
    try {
      const res = await fetchWithCompanyAuth(`${API_BASE_URL}/api/company/api-key`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to generate API key')
      }
      const data = await res.json()
      setApiKey(data.api_key)
      // Update localStorage company object
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('karzo_company')
          if (stored) {
            const parsed = JSON.parse(stored)
            parsed.api_key = data.api_key
            localStorage.setItem('karzo_company', JSON.stringify(parsed))
          }
        } catch (e) {
          console.error('Failed to store api_key in localStorage:', e)
        }
      }
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopy() {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

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

  return (
    <div className="flex h-screen">
      <RecruiterSidebar items={sidebarItems} className="w-64" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Welcome, {company?.name}</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Job Offers</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalJobOffers}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeJobOffers} active
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                    <p className="text-xs text-muted-foreground">
                      Across all job offers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M3 10h18" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                    <p className="text-xs text-muted-foreground">All interviews conducted</p>
                  </CardContent>
                </Card>

              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-sm font-medium">API Key</CardTitle>
                      <CardDescription>Use this key to authenticate API calls.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-muted/50 px-2 py-2 text-sm break-all select-all">
                          {apiKey ? apiKey : 'No API key yet'}
                        </code>
                        <Button variant="secondary" onClick={handleCopy} disabled={!apiKey}>{copied ? 'Copied' : 'Copy'}</Button>
                      </div>
                      <div>
                        <Button onClick={handleGenerateApiKey} disabled={isGenerating}>
                          {isGenerating ? 'Generating...' : (apiKey ? 'Regenerate API Key' : 'Generate API Key')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Interviews</CardTitle>
                    <CardDescription>
                      Pending interviews that need to be conducted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingInterviews.length > 0 ? (
                        upcomingInterviews.map((interview: any, index: number) => (
                          <div key={interview.id} className={index < upcomingInterviews.length - 1 ? "border-b pb-2" : ""}>
                            <p className="font-medium">{interview.candidate_name || interview.candidateName}</p>
                            <p className="text-sm text-muted-foreground">Position: {interview.job_title || interview.jobTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              Status: <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No pending interviews</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
