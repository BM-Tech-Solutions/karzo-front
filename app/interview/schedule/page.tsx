"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockJobs } from "@/lib/mock-data"
import { AuthProvider } from "@/lib/auth-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function ScheduleInterviewPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [selectedJob, setSelectedJob] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedJob || !selectedDate || !selectedTime) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Redirect to dashboard
    router.push("/dashboard")
  }

  // Generate time slots
  const timeSlots = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourFormatted = hour % 12 === 0 ? 12 : hour % 12
      const amPm = hour < 12 ? "AM" : "PM"
      const minuteFormatted = minute === 0 ? "00" : minute
      timeSlots.push(`${hourFormatted}:${minuteFormatted} ${amPm}`)
    }
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Schedule an Interview</h1>

            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
                <CardDescription>Select a position and choose your preferred time</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="job">Position</Label>
                    <Select value={selectedJob} onValueChange={setSelectedJob} required>
                      <SelectTrigger id="job">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockJobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title} - {job.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) =>
                            date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime} required>
                      <SelectTrigger id="time">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="duration" value="30" readOnly />
                      <span className="text-muted-foreground">minutes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">All interviews are scheduled for 30 minutes</p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedJob || !selectedDate || !selectedTime || isSubmitting}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </CardFooter>
            </Card>

            {selectedJob && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Position Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const job = mockJobs.find((job) => job.id === selectedJob)
                    if (!job) return null

                    return (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.company} • {job.location}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Description</h4>
                          <p className="text-sm mt-1">{job.description}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Requirements</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                            {job.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
