"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: number | null
  interviewId: number | null
}

interface Report {
  id: number
  content: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  score: number
  status: string
  created_at: string
}

export function ReportModal({ isOpen, onClose, reportId, interviewId }: ReportModalProps) {
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReport() {
      if (!isOpen || (!reportId && !interviewId)) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Try to fetch report by ID first, then by interview ID if that fails
        const endpoint = reportId 
          ? `${API_BASE_URL}/api/company/reports/${reportId}`
          : `${API_BASE_URL}/api/company/interviews/${interviewId}/report`
        
        const response = await fetchWithCompanyAuth(endpoint)
        
        if (response.ok) {
          const data = await response.json()
          setReport(data)
        } else {
          setError(`Failed to fetch report: ${response.statusText}`)
        }
      } catch (error) {
        setError(`Error fetching report: ${error}`)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchReport()
  }, [isOpen, reportId, interviewId])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Report</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading report...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">
            {error}
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Summary</h3>
              <p className="mt-2 text-gray-700">{report.summary}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Strengths</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Areas for Improvement</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {report.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-gray-700">{weakness}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Recommendation</h3>
              <p className="mt-2 text-gray-700">{report.recommendation}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Score</h3>
              <div className="mt-2 flex items-center">
                <div className="text-2xl font-bold">{report.score}/100</div>
                <div className="ml-4 h-2 w-40 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      report.score >= 80 ? 'bg-green-500' : 
                      report.score >= 60 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`} 
                    style={{ width: `${report.score}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Full Transcript Analysis</h3>
              <div className="mt-2 p-4 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
                {report.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-gray-500">
            No report data available
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
