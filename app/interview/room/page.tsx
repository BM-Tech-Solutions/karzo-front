"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useConversation } from "@/hooks/useConversation"
import { AuthProvider } from "@/lib/auth-context"
import { mockJobs } from "@/lib/mock-data"
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
  } = useConversation()
  const [tipsPanelExpanded, setTipsPanelExpanded] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  // Mock job data
  const job = mockJobs[0]

  // Timer effect for interview duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (interviewStarted) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [interviewStarted])

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle starting the interview
  const handleStartInterview = async () => {
    await startConversation({
      jobOffer: job.title,
      fullName: user?.name || "Candidate",
    })
    setInterviewStarted(true)
  }

  // Handle ending the interview
  const handleEndInterview = async () => {
    await stopConversation()
    setInterviewStarted(false)
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/30">
        <Header />

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
                    {job.title} Interview
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
                        You'll be connected with an AI interviewer for your {job.title} position
                      </p>
                    </div>
                    <Button size="lg" onClick={handleStartInterview}>
                      Start Interview
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Main video feed */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full h-full max-w-4xl max-h-[70vh]">
                        {/* AI Interviewer video placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                          <Avatar className="h-32 w-32">
                            <AvatarImage src="/placeholder.svg?height=128&width=128" alt="AI Interviewer" />
                            <AvatarFallback className="text-4xl">AI</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md text-white text-sm flex items-center">
                            <span>AI Interviewer</span>
                            {/* Audio level indicator */}
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
                          </div>
                        </div>

                        {/* User's video (small overlay) */}
                        <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                            {isCameraOff ? (
                              <VideoOff className="h-8 w-8 text-muted" />
                            ) : (
                              <Avatar className="h-16 w-16">
                                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-white text-xs">
                            You {isMuted && "(Muted)"}
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
                                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
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
                          <h5 className="text-sm font-medium mb-2">For {job.title} Position:</h5>
                          <p className="text-sm text-muted-foreground">
                            Focus on demonstrating your knowledge of{" "}
                            {job.requirements[0].split(" ").slice(0, 3).join(" ")}
                            and {job.requirements[1].split(" ").slice(0, 3).join(" ")}. Be prepared to discuss your
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
