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
  content: any[] | string | null
  report_content?: string | null  // New structured French report
  language_level?: string | null  // Language proficiency level
  summary: string | null
  strengths: any[] | null
  weaknesses: any[] | null
  recommendation: string | null
  score: number | null
  status: string
  created_at: string | null
  candidate_name?: string
  job_title?: string
  duration?: string
  error_message?: string
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
      <DialogContent 
        className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl" 
        aria-describedby="report-content-description"
      >
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            Interview Report
          </DialogTitle>
        </DialogHeader>
        <div id="report-content-description" className="sr-only">
          Detailed interview report including summary, strengths, weaknesses, recommendation, and score.
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <span className="text-slate-600 font-medium">Loading report...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700 font-medium">{error}</div>
          </div>
        ) : report ? (
          <div className="space-y-6 pt-2">
            {/* Display new structured French report if available */}
            {report.report_content ? (
              <div className="space-y-6">
                {(() => {
                  // Normalize report_content: handle cases where backend returned a JSON-stringified object {"report_content": "..."}
                  let normalizedContent = report.report_content || ''
                  
                  try {
                    // Handle different data types
                    if (typeof normalizedContent === 'object' && normalizedContent !== null) {
                      // If it's already an object, extract report_content directly
                      const contentObj = normalizedContent as any
                      if (contentObj.report_content) {
                        normalizedContent = contentObj.report_content
                        console.log('Extracted report_content from object directly')
                      } else {
                        // If it's an object but no report_content field, stringify it
                        normalizedContent = JSON.stringify(normalizedContent)
                      }
                    } else if (typeof normalizedContent === 'string') {
                      const trimmed = normalizedContent.trim()
                      
                      // Check if it's a JSON string that needs parsing
                      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                        console.log('Parsing JSON string:', trimmed.substring(0, 100))
                        const parsed = JSON.parse(trimmed)
                        
                        // Extract report_content from parsed object
                        if (parsed && typeof parsed === 'object' && parsed.report_content) {
                          normalizedContent = parsed.report_content
                          console.log('Successfully extracted report_content from JSON')
                        } else {
                          console.log('No report_content field found in parsed JSON, using parsed object as string')
                          normalizedContent = JSON.stringify(parsed)
                        }
                      }
                      // If it doesn't start with {, it's likely already the content
                      else if (!trimmed.startsWith('{')) {
                        console.log('Content appears to be plain text, using as-is')
                      } else {
                        // Handle malformed JSON - try regex extraction
                        const match = trimmed.match(/"report_content":\s*"([^"]*(?:\\.[^"]*)*)"/);
                        if (match) {
                          normalizedContent = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                          console.log('Used regex to extract report_content from malformed JSON');
                        }
                      }
                    }
                    
                    // Final check: ensure we have string content and handle escaped characters
                    if (typeof normalizedContent !== 'string') {
                      normalizedContent = JSON.stringify(normalizedContent)
                    }
                    
                    // Clean up escaped characters if present
                    normalizedContent = normalizedContent
                      .replace(/\\n/g, '\n')
                      .replace(/\\"/g, '"')
                      .replace(/\\\\/g, '\\')
                      .replace(/\\t/g, '\t')
                    
                    console.log('Final normalized content preview:', normalizedContent.substring(0, 300))
                  } catch (e) {
                    console.warn('Error during normalization, using fallback:', e)
                    // Fallback: try regex extraction from stringified version
                    const originalStr = typeof normalizedContent === 'object' ? JSON.stringify(normalizedContent) : normalizedContent.toString()
                    const match = originalStr.match(/"report_content":\s*"([^"]*(?:\\.[^"]*)*)"/);
                    if (match) {
                      normalizedContent = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                      console.log('Used regex fallback to extract content');
                    } else {
                      normalizedContent = originalStr.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                      console.log('No extraction possible, using raw content with escape cleanup');
                    }
                  }

                  // Parse the report content into sections
                  console.log('Report candidate_name:', report.candidate_name)
                  console.log('Original report content (normalized):', normalizedContent.substring(0, 500))

                  // Detect if content includes markdown-like structure (headers/bold/bullets)
                  const hasMarkdown = /(^#+\s|^\#{1,3}\s|\*\*|^\-\s|^•\s)/m.test(normalizedContent)

                  console.log('Markdown detection result:', hasMarkdown)
                  console.log('Content being tested for markdown:', normalizedContent.substring(0, 200))

                  if (!hasMarkdown) {
                    // Plain text layout: render as a single section preserving line breaks
                    const plain = normalizedContent
                    return [
                      (
                        <div key="plain" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                            <h2 className="text-xl font-bold text-blue-800 flex items-center gap-3">
                              <div className="w-1 h-6 rounded-full bg-blue-500" />
                              Rapport
                            </h2>
                          </div>
                          <div className="p-6">
                            <div
                              className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: plain.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>') }}
                            />
                          </div>
                        </div>
                      )
                    ]
                  }

                  let content = normalizedContent
                    // Replace candidate name with actual candidate name (comprehensive patterns)
                    .replace(/- Candidat : Non mentionné\(e\)/gi, `- Candidat : ${report.candidate_name || 'Nom non disponible'}`)
                    .replace(/\*\*Candidat\*\* : Non mentionné\(e\)/gi, `**Candidat** : ${report.candidate_name || 'Nom non disponible'}`)
                    .replace(/- Candidat : \[.*?\]/g, `- Candidat : ${report.candidate_name || 'Nom non disponible'}`)
                    .replace(/\*\*Candidat\*\* : \[.*?\]/g, `**Candidat** : ${report.candidate_name || 'Nom non disponible'}`)
                    .replace(/\*\*Candidat\*\* : [^\n]*/g, `**Candidat** : ${report.candidate_name || 'Nom non disponible'}`)
                    .replace(/- \*\*Candidat\*\* : \[.*?\]/g, `- **Candidat** : ${report.candidate_name || 'Nom non disponible'}`)
                    .replace(/- \*\*Candidat\*\* : [^\n]*/g, `- **Candidat** : ${report.candidate_name || 'Nom non disponible'}`)
                    // Remove only specific placeholder brackets, not all brackets
                    .replace(/\[Nom Prénom\]/g, report.candidate_name || 'Nom non disponible')
                    .replace(/\[Intitulé du poste\]/g, 'Poste')
                    .replace(/\[Durée totale \+ détail stages\/professionnel\]/g, 'Non spécifié')
                    // Remove empty bracket content but keep structure
                    .replace(/\*\*\[([^\]]+)\]\*\*/g, '**$1**')
                    .replace(/\[([^\]]+)\]/g, '$1')

                  console.log('Processed content:', content.substring(0, 500))

                  const sections = content.split(/(?=^##? )/gm).filter(section => section.trim())

                  return sections.map((section, index) => {
                    const lines = section.trim().split('\n')
                    const title = lines[0].replace(/^##? /, '').trim()
                    const body = lines.slice(1).join('\n').trim()
                    
                    // Skip only completely empty sections
                    if (!title && !body) return null
                    
                    // If no body, create a placeholder
                    const displayBody = body || 'Contenu non disponible'
                    
                    // Determine section color based on title
                    let sectionColor = 'blue'
                    if (title.toLowerCase().includes('en-tête') || title.toLowerCase().includes('structure')) {
                      sectionColor = 'indigo'
                    } else if (title.toLowerCase().includes('présélection')) {
                      sectionColor = 'purple'
                    } else if (title.toLowerCase().includes('évaluation')) {
                      sectionColor = 'green'
                    }
                    
                    return (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        {/* Section Header */}
                        <div className={`px-6 py-4 bg-gradient-to-r ${
                          sectionColor === 'indigo' ? 'from-indigo-50 to-indigo-100 border-b border-indigo-200' :
                          sectionColor === 'purple' ? 'from-purple-50 to-purple-100 border-b border-purple-200' :
                          sectionColor === 'green' ? 'from-green-50 to-green-100 border-b border-green-200' :
                          'from-blue-50 to-blue-100 border-b border-blue-200'
                        }`}>
                          <h2 className={`text-xl font-bold ${
                            sectionColor === 'indigo' ? 'text-indigo-800' :
                            sectionColor === 'purple' ? 'text-purple-800' :
                            sectionColor === 'green' ? 'text-green-800' :
                            'text-blue-800'
                          } flex items-center gap-3`}>
                            <div className={`w-1 h-6 rounded-full ${
                              sectionColor === 'indigo' ? 'bg-indigo-500' :
                              sectionColor === 'purple' ? 'bg-purple-500' :
                              sectionColor === 'green' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}></div>
                            {title}
                          </h2>
                        </div>
                        
                        {/* Section Content */}
                        <div className="p-6">
                          <div 
                            className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: displayBody
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
                                .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-slate-800 mt-6 mb-3 pb-2 border-b border-slate-200">$1</h3>')
                                .replace(/^• (.*$)/gm, '<div class="flex items-start gap-3 mb-3 p-3 bg-slate-50 rounded-lg"><span class="text-blue-500 font-bold mt-0.5">•</span><span class="flex-1">$1</span></div>')
                                .replace(/^\[([^\]]+)\] : (.*$)/gm, '<div class="flex items-start gap-3 mb-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg"><span class="text-amber-600 font-semibold">$1</span><span class="flex-1 text-slate-700">: $2</span></div>')
                                .replace(/\n\n/g, '<br><br>')
                                .replace(/\n/g, '<br>')
                            }}
                          />
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            ) : (
              /* Fallback to old format if new report_content is not available */
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-blue-500 pl-3 bg-blue-50 py-2 rounded-r-lg">Summary</h3>
                  <p className="text-slate-700 leading-relaxed">
                    {typeof report.summary === 'string' ? report.summary : JSON.stringify(report.summary)}
                  </p>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-green-500 pl-3 bg-green-50 py-2 rounded-r-lg">Strengths</h3>
                  <ul className="space-y-2">
                    {Array.isArray(report.strengths) && report.strengths.length > 0 ? (
                      report.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-700">
                          <span className="text-green-500 font-bold mt-1">✓</span>
                          <span>{typeof strength === 'string' ? strength : JSON.stringify(strength)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2 text-slate-500">
                        <span className="text-slate-400 font-bold mt-1">•</span>
                        <span>No specific strengths identified</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-orange-500 pl-3 bg-orange-50 py-2 rounded-r-lg">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {Array.isArray(report.weaknesses) && report.weaknesses.length > 0 ? (
                      report.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-700">
                          <span className="text-orange-500 font-bold mt-1">⚠</span>
                          <span>{typeof weakness === 'string' ? weakness : JSON.stringify(weakness)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2 text-slate-500">
                        <span className="text-slate-400 font-bold mt-1">•</span>
                        <span>No specific areas for improvement identified</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-purple-500 pl-3 bg-purple-50 py-2 rounded-r-lg">Recommendation</h3>
                  <p className="text-slate-700 leading-relaxed">
                    {typeof report.recommendation === 'string' ? report.recommendation : JSON.stringify(report.recommendation)}
                  </p>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-indigo-500 pl-3 bg-indigo-50 py-2 rounded-r-lg">Score</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-slate-800">{((report.score ?? 0) / 20).toFixed(1)}<span className="text-lg text-slate-500">/5</span></div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            (report.score ?? 0) >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                            (report.score ?? 0) >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                            'bg-gradient-to-r from-red-500 to-red-600'
                          }`} 
                          style={{ width: `${(report.score ?? 0)}%` }}
                        />
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {(report.score ?? 0) >= 80 ? 'Excellent' : 
                         (report.score ?? 0) >= 60 ? 'Good' : 
                         'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Language Level Section - shown for both old and new formats */}
            {report.language_level && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-cyan-500 pl-3 bg-cyan-50 py-2 rounded-r-lg">Language Level</h3>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-slate-800">{report.language_level}</div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">
                      {report.language_level === 'Beginner' ? 'Basic understanding, limited vocabulary' :
                       report.language_level === 'Elementary' ? 'Simple conversations, basic grammar' :
                       report.language_level === 'Intermediate' ? 'Good comprehension, decent fluency' :
                       report.language_level === 'Upper-Intermediate' ? 'Strong communication, minor errors' :
                       report.language_level === 'Advanced' ? 'Excellent fluency, near-native proficiency' :
                       'Language proficiency assessed from interview'}
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          report.language_level === 'Advanced' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          report.language_level === 'Upper-Intermediate' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          report.language_level === 'Intermediate' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          report.language_level === 'Elementary' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ 
                          width: report.language_level === 'Advanced' ? '100%' :
                                 report.language_level === 'Upper-Intermediate' ? '80%' :
                                 report.language_level === 'Intermediate' ? '60%' :
                                 report.language_level === 'Elementary' ? '40%' : '20%'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Full Transcript Analysis section removed as requested */}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-slate-400 text-lg">No report data available</div>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Close Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
