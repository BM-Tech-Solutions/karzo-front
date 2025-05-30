"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Mic, Video, Volume2, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { mockJobs } from "@/lib/mock-data"

export default function PreparePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [videoPermission, setVideoPermission] = useState<"granted" | "denied" | "pending">("pending")
  const [audioPermission, setAudioPermission] = useState<"granted" | "denied" | "pending">("pending")
  const [audioLevel, setAudioLevel] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null)
  const audioData = useRef<Uint8Array | null>(null)

  // Mock interview data
  const interviewId = "int1"
  const job = mockJobs[0]

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const testVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setVideoPermission("granted")
    } catch (error) {
      console.error("Error accessing camera:", error)
      setVideoPermission("denied")
    }
  }

  const testAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioPermission("granted")

      // Set up audio analysis
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyser.current = audioContext.current.createAnalyser()
        microphone.current = audioContext.current.createMediaStreamSource(stream)
        microphone.current.connect(analyser.current)
        analyser.current.fftSize = 256
        const bufferLength = analyser.current.frequencyBinCount
        audioData.current = new Uint8Array(bufferLength)

        const checkAudioLevel = () => {
          if (analyser.current && audioData.current) {
            analyser.current.getByteFrequencyData(audioData.current)
            const average = audioData.current.reduce((a, b) => a + b, 0) / audioData.current.length
            setAudioLevel(Math.min(100, average * 2)) // Scale to 0-100
          }
          requestAnimationFrame(checkAudioLevel)
        }
        checkAudioLevel()
      }
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setAudioPermission("denied")
    }
  }

  const runAllTests = async () => {
    await testVideo()
    await testAudio()
    setIsReady(true)
  }

  const handleJoinInterview = () => {
    // Clear any existing interview data from localStorage to ensure a fresh start
    localStorage.removeItem('interview_id')
    
    router.push("/interview/room")
  }

  if (isLoading || !user) {
    return <div>Loading...</div>
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Prepare for Your Interview</h1>
            <p className="text-muted-foreground mb-6">
              Complete the following steps to ensure you're ready for your interview
            </p>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="equipment">Equipment Check</TabsTrigger>
                <TabsTrigger value="tips">Interview Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Details</CardTitle>
                    <CardDescription>Information about your upcoming interview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="font-medium">Position</h3>
                        <p className="text-muted-foreground">{job.title}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Company</h3>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Date & Time</h3>
                        <p className="text-muted-foreground">May 20, 2023 • 2:00 PM</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Duration</h3>
                        <p className="text-muted-foreground">30 minutes</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Job Description</h3>
                      <p className="text-sm">{job.description}</p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Requirements</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => setActiveTab("equipment")}>Continue to Equipment Check</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="equipment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Check</CardTitle>
                    <CardDescription>Test your camera and microphone before the interview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Camera Test</h3>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          className="w-full h-full object-cover"
                          style={{ display: videoPermission === "granted" ? "block" : "none" }}
                        />
                        {videoPermission === "pending" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button onClick={testVideo}>
                              <Video className="mr-2 h-4 w-4" />
                              Test Camera
                            </Button>
                          </div>
                        )}
                        {videoPermission === "denied" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Alert variant="destructive" className="max-w-md">
                              <XCircle className="h-4 w-4" />
                              <AlertTitle>Camera access denied</AlertTitle>
                              <AlertDescription>
                                Please allow camera access in your browser settings and refresh the page.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                      {videoPermission === "granted" && (
                        <Alert>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <AlertTitle>Camera is working properly</AlertTitle>
                          <AlertDescription>Your video is clear and ready for the interview.</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Microphone Test</h3>
                      <div className="bg-muted p-6 rounded-lg flex flex-col items-center justify-center gap-4">
                        {audioPermission === "pending" && (
                          <Button onClick={testAudio}>
                            <Mic className="mr-2 h-4 w-4" />
                            Test Microphone
                          </Button>
                        )}
                        {audioPermission === "granted" && (
                          <>
                            <div className="flex items-center gap-2 w-full">
                              <Volume2 className="h-5 w-5 text-muted-foreground" />
                              <Progress value={audioLevel} className="h-2" />
                            </div>
                            <p className="text-sm text-center">
                              Speak into your microphone to see the audio level indicator move
                            </p>
                          </>
                        )}
                        {audioPermission === "denied" && (
                          <Alert variant="destructive" className="max-w-md">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Microphone access denied</AlertTitle>
                            <AlertDescription>
                              Please allow microphone access in your browser settings and refresh the page.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      {audioPermission === "granted" && audioLevel > 10 && (
                        <Alert>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <AlertTitle>Microphone is working properly</AlertTitle>
                          <AlertDescription>Your audio is clear and ready for the interview.</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={runAllTests} variant="outline" className="mx-2">
                        Run All Tests
                      </Button>
                      <Button
                        onClick={() => setActiveTab("tips")}
                        disabled={videoPermission !== "granted" || audioPermission !== "granted"}
                        className="mx-2"
                      >
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tips" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Tips</CardTitle>
                    <CardDescription>Helpful advice to succeed in your AI interview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <h3 className="font-medium">Before the Interview</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Find a quiet, well-lit space with minimal distractions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Research the company and position thoroughly</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Prepare examples of your relevant experience</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Have a copy of your resume nearby for reference</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Dress professionally as you would for an in-person interview</span>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium">During the Interview</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Speak clearly and at a moderate pace</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Maintain eye contact with the camera</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Use the STAR method (Situation, Task, Action, Result) for examples</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Be concise but thorough in your responses</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>It's okay to take a moment to think before answering</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium">Common Questions</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-muted p-3 rounded-md">
                          <p className="font-medium text-sm">Tell me about yourself</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Focus on your professional background, relevant skills, and why you're interested in this
                            role.
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="font-medium text-sm">What are your strengths and weaknesses?</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Be honest about strengths with examples. For weaknesses, show how you're working to improve.
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="font-medium text-sm">Why do you want to work for this company?</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Research the company and mention specific aspects that align with your career goals.
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="font-medium text-sm">Describe a challenging situation and how you handled it</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use the STAR method to structure your response with a positive outcome.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleJoinInterview} className="w-full">
                      I'm Ready to Start My Interview
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
