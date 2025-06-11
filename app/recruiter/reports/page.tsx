"use client"

import { useState, useEffect } from "react"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCompanyAuth, fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"
import { useToast } from "@/components/ui/use-toast"
import { ReportModal } from "@/components/report-modal"

interface Report {
  id: number
  candidate_name: string
  job_title: string
  status: "processing" | "complete" | "failed"
  interview_id?: number
  guest_interview_id?: number
  created_at: string
  score?: number
  error_message?: string
}

export default function ReportsPage() {
  const { company } = useCompanyAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  
  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])
  
  // Function to fetch reports data
  const fetchReports = async () => {
    try {
      setIsLoading(true)
      // Import and use the getAllReports function from api-service.ts
      const { getAllReports } = await import('@/lib/api-service')
      const data = await getAllReports()
      console.log("Fetched reports data:", data)
      setReports(data)
    } catch (error) {
      console.error("Failed to fetch reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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

  const filteredReports = reports.filter(report => 
    report.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen">
      <RecruiterSidebar items={sidebarItems} className="w-64" />
      <div className="flex-1 overflow-auto">
        {/* Report Modal */}
        <ReportModal 
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedReportId(null);
            setSelectedInterviewId(null);
          }}
          reportId={selectedReportId}
          interviewId={selectedInterviewId}
        />
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Interview Reports</h1>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No reports found</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{report.candidate_name}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Job Position</p>
                        <p className="font-medium">{report.job_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created Date</p>
                        <p className="font-medium">{formatDate(report.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="font-medium">{report.score ? `${report.score}/100` : 'N/A'}</p>
                      </div>
                    </div>
                    {report.status === "failed" && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                        <p className="font-medium">Report generation failed</p>
                        <p className="text-xs mt-1">{report.error_message || "An error occurred during report generation."}</p>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      {report.status === "complete" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-2 bg-green-50 text-green-600 hover:bg-green-100"
                          onClick={() => {
                            setSelectedReportId(report.id);
                            setSelectedInterviewId(report.interview_id || report.guest_interview_id || null);
                            setIsReportModalOpen(true);
                          }}
                        >
                          View Report
                        </Button>
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
