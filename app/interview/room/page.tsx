"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useConversation } from "@/hooks/useConversation"
import { AuthProvider } from "@/lib/auth-context"
import { API_BASE_URL } from "@/lib/config"
import { completeGuestInterview } from "@/lib/api-service"

import {
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  MessageSquare,
  Clock,
  CheckCircle2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  User,
  MoreVertical,
  MessageSquareText,
  Users,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function InterviewRoomPage() {
  const { user } = useAuth()
  const router = useRouter()
  const {
    error,
    connectionStatus,
    isConnected,
    startConversation,
    stopConversation,
    isMuted,
    toggleMute,
    isCameraOff,
    toggleCamera,
    isScreenSharing,
    toggleScreenShare,
    audioLevel,
    permissionRequested,
    permissionGranted,
    grantPermission,
    denyPermission,
    cameraStream,
    sessionEnded
  } = useConversation()
  const [tipsPanelExpanded, setTipsPanelExpanded] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  // Using error from useConversation hook
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  
  // Add these state variables to your component if not already there
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState<string | null>(null)
  const [company, setCompany] = useState<string | null>(null)
  const [jobRequirements, setJobRequirements] = useState<string[]>([])
  const [candidateSummary, setCandidateSummary] = useState<string>('')
  const [guestInterviewId, setGuestInterviewId] = useState<string | null>(null)
  
  // Define handleEndInterview function using useCallback to prevent infinite loops
  const handleEndInterview = useCallback(async () => {
    await stopConversation()
    
    // Get the conversation ID from localStorage for debugging
    const conversationId = localStorage.getItem('debug_conversation_id')
    console.log("=== INTERVIEW COMPLETION ===")
    console.log(`Conversation ID at interview completion: ${conversationId}`)
    console.log("==============================")
    
    // Save interview data to the database
    try {
      // Check if this is a guest interview (no user or guest token in localStorage)
      const isGuestInterview = !user && localStorage.getItem('guest_interview_id')
      
      if (isGuestInterview) {
        // This is a guest interview, update its status to "passed"
        const guestInterviewId = parseInt(localStorage.getItem('guest_interview_id') || '0')
        
        if (guestInterviewId) {
          const conversationId = localStorage.getItem('debug_conversation_id') || undefined
          console.log(`Marking guest interview ${guestInterviewId} as completed with conversation ID: ${conversationId}`)
          try {
            await completeGuestInterview(guestInterviewId, conversationId)
            console.log(`Successfully marked guest interview ${guestInterviewId} as completed`)
          } catch (error) {
            console.error('Error marking guest interview as completed:', error)
          }
          
          // Redirect to thank you page for guest users
          router.push('/review/thank-you')
        }
      } else if (user && jobId) {
        // This is a logged-in user interview
        // Save the interview data and redirect to the review page
        console.log(`Saving interview data for user ${user.id} and job ${jobId}`)
        
        // Redirect to review page for logged-in users
        router.push('/review')
      } else {
        // Fallback redirect
        router.push('/review/thank-you')
      }
    } catch (error) {
      console.error('Error saving interview:', error)
      // Still redirect to review page even if saving fails
      router.push('/review')
    }
    
    setInterviewStarted(false)
  }, [stopConversation, router, user, jobId])
  
  // Effect to handle automatic navigation when session ends
  useEffect(() => {
    if (sessionEnded && interviewStarted) {
      console.log("Session ended automatically, handling interview completion")
      handleEndInterview()
    }
  }, [sessionEnded, interviewStarted, handleEndInterview])
  
  // State variables already defined above
  
  // Add this function to fetch guest candidate summary
  const fetchGuestCandidateSummary = async (interviewId: string) => {
    try {
      // First check if we already have a candidate summary in localStorage
      const storedSummary = localStorage.getItem('candidate_summary');
      if (storedSummary) {
        console.log(`Using stored candidate summary from localStorage: ${storedSummary.substring(0, 50)}...`);
        setCandidateSummary(storedSummary);
        return;
      }
      
      console.log(`Fetching candidate summary for interview ID: ${interviewId}`);
      
      // Try to fetch from backend API
      try {
        const response = await fetch(`${API_BASE_URL}/api/company/guest-interviews/${interviewId}/summary`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log(`Candidate summary fetch response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Candidate summary response data:', data);
          
          if (data.candidate_summary) {
            console.log(`Setting candidate summary from API: ${data.candidate_summary.substring(0, 50)}...`);
            setCandidateSummary(data.candidate_summary);
            localStorage.setItem('candidate_summary', data.candidate_summary);
            
            // Check for company name in the response
            if (data.company_name) {
              console.log(`Setting company name from API: ${data.company_name}`);
              setCompany(data.company_name);
              localStorage.setItem('interview_company', data.company_name);
            }
            
            // Check for job offer questions in the response
            if (data.joboffer_questions && Array.isArray(data.joboffer_questions)) {
              console.log(`Setting ${data.joboffer_questions.length} job offer questions from API`);
              localStorage.setItem('job_offer_questions', JSON.stringify(data.joboffer_questions));
            }
            
            return;
          }
        } else {
          console.error('Failed to fetch candidate summary, status:', response.status);
          try {
            const errorData = await response.json();
            console.error('Error details:', errorData);
          } catch (e) {
            console.error('Could not parse error response');
          }
        }
      } catch (apiError) {
        console.error('API error fetching candidate summary:', apiError);
      }
      
      // If we get here, both localStorage and API fetch failed
      // Use the guest candidate name to create a fallback summary
      const guestName = localStorage.getItem('guest_candidate_name') || 'Candidate';
      const jobTitle = localStorage.getItem('interview_job_title') || 'the position';
      const company = localStorage.getItem('interview_company') || 'the company';
      
      const fallbackSummary = `${guestName} is a candidate for ${jobTitle} at ${company}. The candidate has relevant skills and experience for this position.`;
      
      console.log(`Using fallback candidate summary: ${fallbackSummary}`);
      setCandidateSummary(fallbackSummary);
      localStorage.setItem('candidate_summary', fallbackSummary);
    } catch (error) {
      console.error('Unhandled error in fetchGuestCandidateSummary:', error);
      
      // Ultimate fallback
      const basicFallback = "Candidate has applied for this position and has relevant skills and experience.";
      setCandidateSummary(basicFallback);
      localStorage.setItem('candidate_summary', basicFallback);
    }
  };

  // Add this useEffect to load job data from localStorage and clear any existing interview data
  useEffect(() => {
    // Clear any existing interview ID to ensure we start fresh
    // This prevents issues with creating reports for the wrong interview
    localStorage.removeItem('interview_id')
    
    const storedJobId = localStorage.getItem('interview_job_id')
    const storedJobTitle = localStorage.getItem('interview_job_title')
    const storedCompany = localStorage.getItem('interview_company')
    const storedRequirements = localStorage.getItem('interview_job_requirements')
    const storedGuestInterviewId = localStorage.getItem('guest_interview_id')
    
    if (storedGuestInterviewId) {
      setGuestInterviewId(storedGuestInterviewId)
      // Fetch candidate summary for guest interviews
      fetchGuestCandidateSummary(storedGuestInterviewId)
    }
    
    if (storedJobId) {
      setJobId(storedJobId)
      
      if (storedJobTitle) setJobTitle(storedJobTitle)
      if (storedCompany) setCompany(storedCompany)
      
      // If we have the job ID but not the title or company, fetch them
      if (!storedJobTitle || !storedCompany) {
        fetchJobDetails(storedJobId)
      }
      
      // Parse requirements if available
      if (storedRequirements) {
        try {
          const parsedRequirements = JSON.parse(storedRequirements)
          setJobRequirements(Array.isArray(parsedRequirements) ? parsedRequirements : [])
        } catch (e) {
          console.error('Error parsing job requirements:', e)
        }
      }
    }
  }, [])
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async () => {
    try {
      setIsStarting(true);
      // Error is managed by the useConversation hook
      
      // Ensure we have a candidate summary
      let summary = candidateSummary;
      if (!summary) {
        // Try to get from localStorage first
        summary = localStorage.getItem('candidate_summary') || '';
        
        // If still no summary, create a fallback
        if (!summary) {
          const guestName = localStorage.getItem('guest_candidate_name') || 'Candidate';
          const jobTitle = localStorage.getItem('interview_job_title') || 'the position';
          const company = localStorage.getItem('interview_company') || 'the company';
          
          summary = `${guestName} is a candidate for ${jobTitle} at ${company}. The candidate has relevant skills and experience for this position.`;
          console.log(`Using fallback summary in handleStartInterview: ${summary}`);
        }
      }
      
      // Get the guest candidate name
      const guestName = localStorage.getItem('guest_candidate_name') || 'Candidate';
      
      // Get job offer questions if available
      let jobOfferQuestions: string[] = [];
      try {
        console.log('Checking localStorage for job_offer_questions...');
        const storedQuestions = localStorage.getItem('job_offer_questions');
        console.log('Raw stored questions:', storedQuestions);
        
        if (storedQuestions) {
          jobOfferQuestions = JSON.parse(storedQuestions);
          console.log('Parsed job offer questions:', jobOfferQuestions);
        } else {
          console.log('No job offer questions found in localStorage');
          
          // Try to fetch job questions directly before starting the interview
          try {
            // Use the jobId from state or a fallback
            const currentJobId = jobId || ''; // Default to job ID 2 if not available
            console.log(`Attempting to fetch job questions for job ID ${currentJobId}...`);
            const questionsResponse = await fetch(`/api/job-questions?job_offer_id=${currentJobId}`);
            console.log('Questions API response status:', questionsResponse.status);
            
            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json();
              console.log('Questions API response data:', questionsData);
              
              if (Array.isArray(questionsData) && questionsData.length > 0) {
                // Extract just the question text from each question object
                jobOfferQuestions = questionsData.map(q => q.question || q);
                console.log('Extracted job offer questions:', jobOfferQuestions);
                localStorage.setItem('job_offer_questions', JSON.stringify(jobOfferQuestions));
              }
            }
          } catch (questionsError) {
            console.error('Error fetching job questions at interview start:', questionsError);
          }
          
          // If still no questions, try to use hardcoded questions for this specific job
          if (jobOfferQuestions.length === 0 && jobTitle === 'Generative AI Engineer') {
            console.log('Using hardcoded questions for Generative AI Engineer position');
            jobOfferQuestions = [
              'Prompt engineering',
              'LangChain',
              'fine-tuning an LLM vs. using RAG'
            ];
            localStorage.setItem('job_offer_questions', JSON.stringify(jobOfferQuestions));
          }
        }
      } catch (e) {
        console.error('Error handling job offer questions:', e);
      }
      
      // Get company name from localStorage
      const companyName = localStorage.getItem('interview_company') || '';
      
      // Fetch company details
      const companyDetails = companyName ? await fetchCompanyDetails(companyName) : null;
      
      // Store company data in localStorage for the conversation hook to access
      if (companyDetails) {
        localStorage.setItem('company_size', companyDetails.size || '');
        localStorage.setItem('company_sector', companyDetails.sector || '');
        localStorage.setItem('company_about', companyDetails.about || '');
        localStorage.setItem('company_website', companyDetails.website || '');
      } else {
        // Fallback to empty strings if company details not found
        localStorage.setItem('company_size', '');
        localStorage.setItem('company_sector', '');
        localStorage.setItem('company_about', '');
        localStorage.setItem('company_website', '');
      }
      
      // Get form data for the conversation
      const formData = {
        jobOffer: jobTitle || '',
        // Use user's full name if available, then try localStorage, then fallback to 'Candidate'
        fullName: user?.full_name || localStorage.getItem('guest_candidate_name') || 'Candidate',
        candidateSummary: candidateSummary || '',
        companyName: company || '',
        companySize: localStorage.getItem('company_size') || '',
        companySector: localStorage.getItem('company_sector') || '',
        companyAbout: localStorage.getItem('company_about') || '',
        companyWebsite: localStorage.getItem('company_website') || '',
        jobOfferQuestions: JSON.parse(localStorage.getItem('job_offer_questions') || '[]')
      };

      // Start the conversation with ElevenLabs
      await startConversation(formData);
      
      // Start the interview
      setInterviewStarted(true);
      
      // Start the timer
      const timer = setInterval(() => {
        setCurrentTime((prev: number) => prev + 1);
      }, 1000);
      
      setStartTime(Date.now());
      
      return () => clearInterval(timer); // Clean up timer when component unmounts
    } catch (error) {
      console.error('Error starting interview:', error);
      setIsStarting(false);
    }
  };

  // Function to fetch company details by name
  const fetchCompanyDetails = async (companyName: string) => {
    try {
      // Use the same base URL as other API calls in the app
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${apiUrl}/api/company/details?name=${encodeURIComponent(companyName)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch company details');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company details:', error);
      return null;
    }
  };

  // Add this function to fetch job details
  const fetchJobDetails = async (id: string) => {
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('karzo_token')
      
      // First try to fetch job offer details
      const jobOfferResponse = await fetch(`${API_BASE_URL}/api/v1/job-offers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (jobOfferResponse.ok) {
        const jobData = await jobOfferResponse.json()
        setJobTitle(jobData.title)
        setCompany(jobData.company)
        
        // Store these values for future use
        localStorage.setItem('interview_job_title', jobData.title)
        localStorage.setItem('interview_company', jobData.company)
        
        // Store job requirements/questions if available
        if (jobData.requirements && Array.isArray(jobData.requirements)) {
          setJobRequirements(jobData.requirements)
          localStorage.setItem('job_requirements', JSON.stringify(jobData.requirements))
        }
        
        // Store job offer questions if available
        if (jobData.questions && Array.isArray(jobData.questions)) {
          localStorage.setItem('job_offer_questions', JSON.stringify(jobData.questions))
          console.log(`Stored ${jobData.questions.length} job offer questions in localStorage`)
        } else {
          // Try to fetch job questions directly from our new API endpoint
          try {
            const questionsResponse = await fetch(`/api/job-questions?job_offer_id=${id}`)
            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json()
              if (Array.isArray(questionsData)) {
                // Extract just the question text from each question object
                const questions = questionsData.map(q => q.question || q)
                localStorage.setItem('job_offer_questions', JSON.stringify(questions))
                console.log(`Stored ${questions.length} job offer questions from API endpoint`)
              }
            }
          } catch (questionsError) {
            console.error('Error fetching job questions:', questionsError)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
    }
  }
  
  // The handleEndInterview function is already defined above

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/30">
        {error && (
          <Alert variant="destructive" className="mx-auto mt-4 max-w-3xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <main className="flex-1 container py-4 px-4 relative h-[calc(100vh-56px)]">
          <div className="flex h-full gap-4">
            {/* Main Video Conference Area */}
            <div className="flex-1 flex flex-col">
              {/* Top bar with meeting info */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    {jobTitle || "Job"} Interview
                  </h1>
                  <p className="text-sm text-muted-foreground">{connectionStatus}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">{formatTime(currentTime)}</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => setShowParticipants(!showParticipants)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Participants</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => setShowChat(!showChat)}
                        >
                          <MessageSquareText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Chat</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>More options</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Video conference area */}
              <div className="flex-1 bg-black/5 rounded-xl overflow-hidden relative flex items-center justify-center">
                {!interviewStarted ? (
                  <div className="text-center p-8">
                    <div className="mb-6">
                      <div className="mx-auto bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                        <User className="h-12 w-12 text-primary" />
                      </div>
                      <h2 className="text-xl font-medium">Ready to start your interview?</h2>
                      <p className="text-muted-foreground mt-2 mb-6">
                        You'll be connected with an AI interviewer for your {jobTitle || "Job"} position
                      </p>
                      <Alert className="mb-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Microphone Access</AlertTitle>
                        <AlertDescription>
                          Your browser will ask for microphone access. This is optional but recommended for the best experience.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={handleStartInterview} 
                      disabled={isStarting}
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        'Start Interview'
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Main video feed */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full h-full max-w-4xl max-h-[70vh]">
                        {/* User's video (main view) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                          <div className="w-full h-full flex items-center justify-center">
                            {isCameraOff ? (
                              <div className="flex flex-col items-center justify-center">
                                <VideoOff className="h-16 w-16 text-muted mb-4" />
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleCamera()}
                                  className="bg-primary/20 hover:bg-primary/30"
                                >
                                  <Video className="h-4 w-4 mr-2" />
                                  Enable Camera
                                </Button>
                              </div>
                            ) : (
                              <div className="relative w-full h-full">
                                <video 
                                  ref={(videoElement) => {
                                    if (videoElement && cameraStream && !videoElement.srcObject) {
                                      videoElement.srcObject = cameraStream;
                                      videoElement.play().catch(err => console.error("Error playing video:", err));
                                    }
                                  }}
                                  className="w-full h-full object-cover rounded-lg"
                                  muted
                                  playsInline
                                />
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md text-white text-sm flex items-center">
                            <span>You {isMuted && "(Muted)"}</span>
                            {!isMuted && (
                              <div className="ml-2 flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-0.5 h-3 bg-green-500 transition-all duration-100"
                                    style={{
                                      height: `${Math.min(12, Math.max(3, audioLevel * 12 * Math.random()))}px`,
                                      opacity: audioLevel > i / 10 ? 1 : 0.3,
                                    }}
                                  ></div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI Interviewer video (small overlay) */}
                        <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src="/karzo.png" alt="AI Interviewer" />
                              <AvatarFallback className="text-lg">AI</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-white text-xs">
                            AI Interviewer
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Side panels (chat or participants) */}
                    {(showChat || showParticipants) && (
                      <div className="absolute top-4 right-4 bottom-4 w-64 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden flex flex-col">
                        <div className="p-3 border-b flex items-center justify-between">
                          <h3 className="font-medium">{showChat ? "Chat" : showParticipants ? "Participants" : ""}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setShowChat(false)
                              setShowParticipants(false)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                          {showChat && (
                            <div className="text-center text-sm text-muted-foreground py-8">No messages yet</div>
                          )}
                          {showParticipants && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>AI</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">AI Interviewer</p>
                                    <p className="text-xs text-muted-foreground">Host</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{user?.full_name?.charAt(0) || "U"}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">You</p>
                                    <p className="text-xs text-muted-foreground">Candidate</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Controls bar */}
              {interviewStarted && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="bg-background rounded-full shadow-lg border p-1 flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isMuted ? "secondary" : "ghost"}
                            size="icon"
                            className="rounded-full h-10 w-10"
                            onClick={toggleMute}
                          >
                            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isCameraOff ? "secondary" : "ghost"}
                            size="icon"
                            className="rounded-full h-10 w-10"
                            onClick={toggleCamera}
                          >
                            {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isCameraOff ? "Turn on camera" : "Turn off camera"}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isScreenSharing ? "secondary" : "ghost"}
                            size="icon"
                            className="rounded-full h-10 w-10"
                            onClick={toggleScreenShare}
                          >
                            <ScreenShare className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share screen</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-10 w-10"
                            onClick={() => setShowChat(!showChat)}
                          >
                            <MessageSquareText className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Chat</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="rounded-full h-10 w-10 ml-2"
                            onClick={handleEndInterview}
                          >
                            <PhoneOff className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>End interview</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>

            {/* Tips Panel - Now on the right */}
            <div className={cn("w-80 transition-all duration-300 ease-in-out", tipsPanelExpanded ? "w-96" : "")}>
              <Card className="sticky top-20 overflow-hidden border-primary/20 shadow-lg h-[calc(100vh-100px)]">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 flex items-center justify-between border-b">
                  <h3 className="font-semibold flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                    Interview Tips
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setTipsPanelExpanded(!tipsPanelExpanded)}
                    >
                      {tipsPanelExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <CardContent className="p-0">
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-none bg-muted/50">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="technical">Technical</TabsTrigger>
                      <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                    </TabsList>

                    <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                      <TabsContent value="general" className="m-0 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                            Communication Tips
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Speak clearly and at a moderate pace</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Use specific examples in your answers</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Take a moment to think before answering</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Be concise but thorough</span>
                            </li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center">
                            <Info className="h-4 w-4 mr-2 text-primary" />
                            General Advice
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Maintain a professional demeanor</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Show enthusiasm for the role and company</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Listen carefully to each question</span>
                            </li>
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="technical" className="m-0 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                            Technical Interview Tips
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Explain your thought process as you solve problems</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Discuss trade-offs in your solutions</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Mention relevant technologies and frameworks</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Relate technical concepts to real-world applications</span>
                            </li>
                          </ul>
                        </div>

                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <h5 className="text-sm font-medium mb-2">For {jobTitle} Position:</h5>
                          <p className="text-sm text-muted-foreground">
                            Focus on demonstrating your knowledge of{" "}
                            {jobRequirements[0] ? jobRequirements[0].split(" ").slice(0, 3).join(" ") : "relevant technologies"}
                            {jobRequirements[1] ? ` and ${jobRequirements[1].split(" ").slice(0, 3).join(" ")}` : ""}. Be prepared to discuss your
                            experience with these technologies in detail.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="behavioral" className="m-0 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                            Behavioral Interview Tips
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Use the STAR method (Situation, Task, Action, Result)</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Highlight your role in team achievements</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Discuss how you've overcome challenges</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                              <span className="text-sm">Show enthusiasm for the role and company</span>
                            </li>
                          </ul>
                        </div>

                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <h5 className="text-sm font-medium mb-2">STAR Method Example:</h5>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Situation:</strong> Describe the context or background
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Task:</strong> Explain your responsibility or challenge
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Action:</strong> Detail the specific steps you took
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Result:</strong> Share the outcomes and what you learned
                          </p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}