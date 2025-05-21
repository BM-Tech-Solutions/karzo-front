"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Video, Download } from "lucide-react"
import Link from "next/link"

export default function ResourcesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div>Loading...</div>
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Interview Resources</h1>
              <p className="text-muted-foreground">Helpful resources to prepare for your interviews</p>
            </div>

            <Tabs defaultValue="guides" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="guides">Interview Guides</TabsTrigger>
                <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
                <TabsTrigger value="templates">Answer Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="guides" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Technical Interview Preparation</CardTitle>
                      </div>
                      <CardDescription>Essential tips for technical interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Learn how to approach technical questions, whiteboard challenges, and coding exercises with
                        confidence.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="#">Read Guide</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Behavioral Interview Questions</CardTitle>
                      </div>
                      <CardDescription>Master the STAR method</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Prepare for behavioral questions using the Situation, Task, Action, Result framework with real
                        examples.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="#">Read Guide</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Remote Interview Success</CardTitle>
                      </div>
                      <CardDescription>Tips for virtual interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Optimize your setup, appearance, and communication for successful remote interviews.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="#">Read Guide</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Answering Salary Questions</CardTitle>
                      </div>
                      <CardDescription>Negotiate with confidence</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Learn strategies for discussing compensation and benefits during your interview.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="#">Read Guide</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Questions to Ask Interviewers</CardTitle>
                      </div>
                      <CardDescription>Make a strong impression</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Thoughtful questions that demonstrate your interest and help you evaluate the opportunity.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="#">Read Guide</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Common Interview Mistakes</CardTitle>
                      </div>
                      <CardDescription>Pitfalls to avoid</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Learn about common mistakes candidates make and how to avoid them in your interviews.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="#">Read Guide</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="videos" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <div className="aspect-video bg-muted rounded-t-lg"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        <CardTitle>How to Answer "Tell Me About Yourself"</CardTitle>
                      </div>
                      <CardDescription>5:32 • 15K views</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Learn the perfect structure for answering this common interview opener in a way that highlights
                        your relevant experience.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Watch Video
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <div className="aspect-video bg-muted rounded-t-lg"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        <CardTitle>Body Language Tips for Interviews</CardTitle>
                      </div>
                      <CardDescription>7:15 • 8.2K views</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Master the non-verbal cues that make a positive impression during in-person and video
                        interviews.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Watch Video
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <div className="aspect-video bg-muted rounded-t-lg"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        <CardTitle>Technical Interview Walkthrough</CardTitle>
                      </div>
                      <CardDescription>12:48 • 23K views</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Watch a mock technical interview with commentary on effective problem-solving approaches.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Watch Video
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <div className="aspect-video bg-muted rounded-t-lg"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        <CardTitle>Answering Difficult Questions</CardTitle>
                      </div>
                      <CardDescription>9:24 • 11K views</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Strategies for handling challenging questions about gaps in employment, weaknesses, and
                        failures.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Watch Video
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>STAR Method Examples</CardTitle>
                      </div>
                      <CardDescription>For behavioral questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Ready-to-use templates for structuring your answers to common behavioral interview questions.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Technical Problem Framework</CardTitle>
                      </div>
                      <CardDescription>For coding challenges</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Step-by-step approach to solving technical problems during interviews with example scripts.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Strengths & Weaknesses</CardTitle>
                      </div>
                      <CardDescription>Answer frameworks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Templates for discussing your strengths and weaknesses in a professional and honest manner.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Interview Preparation Checklist</CardTitle>
                      </div>
                      <CardDescription>Pre-interview guide</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Comprehensive checklist to ensure you're fully prepared for your upcoming interview.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Thank You Email Templates</CardTitle>
                      </div>
                      <CardDescription>Post-interview follow-up</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Professional email templates to send after your interview to leave a positive impression.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Salary Negotiation Scripts</CardTitle>
                      </div>
                      <CardDescription>For offer discussions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Templates for discussing compensation and benefits to help you negotiate effectively.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
