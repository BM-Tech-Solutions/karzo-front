"use client"

import { useState, useEffect } from "react"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCompanyAuth, fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"
import { generateReportFromTranscript, checkReportStatus, markGuestInterviewDone } from "@/lib/api-service"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ReportModal } from "@/components/report-modal"

interface Interview {
  id: number
  candidate_name: string
  job_offer_title: string
  scheduled_date: string
  status: "scheduled" | "completed" | "cancelled" | "passed" | "pending" | "processing" | "done"
  conversation_id?: string
  report_id?: number
  report_status?: "processing" | "complete" | "failed" | null
}

export default function InterviewsPage() {
  const { company } = useCompanyAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [processingReports, setProcessingReports] = useState<Record<number, boolean>>({})
  const { toast } = useToast()
  
  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null)

  useEffect(() => {
    fetchInterviews()
  }, [])
  
  // Function to fetch interviews data
  const fetchInterviews = async () => {
    try {
      setIsLoading(true)
      // Fetch interviews from the backend API using the combined endpoint that includes guest interviews
      const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/company/interviews/`)
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched interviews data:", data) // Debug log to see what's coming from the API
        
        // Map the data to ensure consistent field names
        const normalizedInterviews = data.map((interview: any) => ({
          id: interview.id,
          candidate_name: interview.candidate_name,
          job_offer_title: interview.job_title,
          scheduled_date: interview.date || new Date().toISOString(),
          status: interview.status,
          conversation_id: interview.conversation_id,
          report_id: interview.report_id,
          report_status: interview.report_status
        }))
        
        setInterviews(normalizedInterviews)
      } else {
        console.error("Failed to fetch interviews:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to handle report generation
  const handleGenerateReport = async (interviewId: number, conversationId: string | undefined) => {
    console.log("=== RECRUITER PAGE - GENERATE REPORT ===");
    console.log(`Interview ID: ${interviewId}`);
    console.log(`Conversation ID from interview data: ${conversationId}`);
    console.log("======================================");
    
    if (!conversationId) {
      console.error("No conversation ID available for this interview");
      toast({ 
        title: "No Conversation Available", 
        description: "This interview doesn't have a conversation transcript yet.",
        variant: "destructive"
      })
      return
    }
    
    setProcessingReports(prev => ({ ...prev, [interviewId]: true }))
    
    try {
      const result = await generateReportFromTranscript(interviewId, conversationId)
      const reportId = result.report_id
      
      // Update the interviews list immediately to show processing status
      setInterviews(prevInterviews => 
        prevInterviews.map(interview => 
          interview.id === interviewId 
            ? { ...interview, report_id: reportId, report_status: "processing" } 
            : interview
        )
      )
      
      // Start polling for report status
      const checkInterval = setInterval(async () => {
        try {
          const statusResult = await checkReportStatus(reportId)
          console.log(`Report ${reportId} status:`, statusResult)
          
          if (statusResult.status === "complete" || statusResult.status === "completed") {
            clearInterval(checkInterval)
            setProcessingReports(prev => ({ ...prev, [interviewId]: false }))
            
            // Mark the interview as done after successful report generation
            try {
              await markGuestInterviewDone(interviewId);
              console.log(`Interview ${interviewId} marked as done after report generation`);
              
              // Update the local state to reflect the change immediately
              setInterviews(prevInterviews => 
                prevInterviews.map(interview => 
                  interview.id === interviewId 
                    ? { ...interview, status: "done", report_status: "complete" } 
                    : interview
                )
              )
            } catch (error) {
              console.error(`Failed to mark interview ${interviewId} as done:`, error);
            }
            
            // Refresh the data from server
            fetchInterviews()
            toast({ 
              title: "Report Generated", 
              description: "The interview report has been successfully generated.",
              variant: "default"
            })
          } else if (statusResult.status === "failed") {
            clearInterval(checkInterval)
            setProcessingReports(prev => ({ ...prev, [interviewId]: false }))
            
            // Update the local state
            setInterviews(prevInterviews => 
              prevInterviews.map(interview => 
                interview.id === interviewId 
                  ? { ...interview, report_status: "failed" } 
                  : interview
              )
            )
            
            fetchInterviews()
            toast({ 
              title: "Report Generation Failed", 
              description: statusResult.error_message || "Failed to generate the interview report.",
              variant: "destructive"
            })
          }
        } catch (error) {
          console.error("Error checking report status:", error)
        }
      }, 5000) // Check every 5 seconds instead of 10
    } catch (error) {
      console.error("Error generating report:", error)
      setProcessingReports(prev => ({ ...prev, [interviewId]: false }))
      toast({ 
        title: "Error", 
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      })
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
                      {interview.conversation_id && (
                        <div>
                          <p className="text-sm text-muted-foreground">Conversation ID</p>
                          <p className="font-medium text-xs truncate" title={interview.conversation_id}>{interview.conversation_id}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Scheduled Date</p>
                        <p className="font-medium">{formatDate(interview.scheduled_date)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      {/* View Report button - only show if report is generated */}
                      {interview.report_status === "complete" && interview.report_id ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-2 bg-green-50 text-green-600 hover:bg-green-100"
                          onClick={() => {
                            setSelectedReportId(interview.report_id || null);
                            setSelectedInterviewId(interview.id);
                            setIsReportModalOpen(true);
                          }}
                        >
                          View Report
                        </Button>
                      ) : processingReports[interview.id] ? (
                        // Report is processing
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-2" 
                          disabled
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </Button>
                      ) : (
                        // No report yet - show generate button (disabled unless interview is passed)
                        <div className="relative group">
                          {interview.status === "done" ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              disabled
                            >
                              Report Generated
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              disabled={interview.status !== "passed" && interview.status !== "processing"}
                              onClick={() => {
                                // If interview has conversation ID, generate report directly
                                if (interview.conversation_id) {
                                  handleGenerateReport(interview.id, interview.conversation_id);
                                } else {
                                  // Otherwise show a message that no conversation exists yet
                                  toast({
                                    title: "No Conversation Available",
                                    description: "This interview doesn't have a conversation transcript yet.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              {interview.status !== "passed" && interview.status !== "processing" ? "Interview Not Completed" : "Generate Report"}
                            </Button>
                          )}
                          {interview.status !== "passed" && interview.status !== "processing" && interview.status !== "done" && (
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              Report generation is only available after the interview is completed
                            </div>
                          )}
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
