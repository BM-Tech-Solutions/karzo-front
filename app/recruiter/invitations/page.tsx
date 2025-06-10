"use client"

import { useState, useEffect } from "react"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompanyAuth, fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { candidateInviteSchema } from "@/lib/company-form-schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface JobOffer {
  id: number
  title: string
}

interface Invitation {
  id: number
  email: string
  job_offer_title: string
  status: "pending" | "accepted" | "expired"
  created_at: string
}

export default function InvitationsPage() {
  const { company } = useCompanyAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  const form = useForm({
    resolver: zodResolver(candidateInviteSchema),
    defaultValues: {
      email: "",
      jobOfferId: undefined,
    },
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        // Fetch invitations and job offers from the backend API
        const [invitationsRes, jobOffersRes] = await Promise.all([
          fetchWithCompanyAuth(`${API_BASE_URL}/api/company/invitations/`),
          fetchWithCompanyAuth(`${API_BASE_URL}/api/job-offers/company/`),
        ])

        if (invitationsRes.ok && jobOffersRes.ok) {
          const [invitationsData, jobOffersData] = await Promise.all([
            invitationsRes.json(),
            jobOffersRes.json(),
          ])

          setInvitations(invitationsData)
          setJobOffers(jobOffersData)
        } else {
          console.error("Failed to fetch data: One or more requests failed")
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (values: { email: string; jobOfferId?: number }) => {
    setInviteError("")
    setInviteSuccess("")

    try {
      // This endpoint would need to be implemented in the backend
      const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/company/invitations/`, {
        method: "POST",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to send invitation")
      }

      setInviteSuccess(`Invitation sent to ${values.email}`)
      form.reset()
      setIsDialogOpen(false)

      // Add the new invitation to the list (in a real app, you'd get the full data from the API)
      const newInvitation: Invitation = {
        id: Math.floor(Math.random() * 1000), // This would come from the API
        email: values.email,
        job_offer_title: jobOffers.find(job => job.id === values.jobOfferId)?.title || "Unknown Position",
        status: "pending",
        created_at: new Date().toISOString(),
      }

      setInvitations([newInvitation, ...invitations])
    } catch (err) {
      setInviteError((err as Error).message)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      href: "/recruiter/invitations",
      title: "Invitations",
    },
  ]

  return (
    <div className="flex h-screen">
      <RecruiterSidebar items={sidebarItems} className="w-64" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Candidate Invitations</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Invite Candidate</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invite a Candidate</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to a candidate for a specific job position.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Candidate Email</FormLabel>
                          <FormControl>
                            <Input placeholder="candidate@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobOfferId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Position (Optional)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a job position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {jobOffers.map((job) => (
                                <SelectItem key={job.id} value={job.id.toString()}>
                                  {job.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {inviteError && <div className="text-sm font-medium text-destructive">{inviteError}</div>}
                    <DialogFooter>
                      <Button type="submit">Send Invitation</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {inviteSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {inviteSuccess}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-lg text-muted-foreground">No invitations sent yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click the "Invite Candidate" button to send your first invitation
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <Card key={invitation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{invitation.email}</CardTitle>
                        <CardDescription className="mt-1">
                          Position: {invitation.job_offer_title}
                        </CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(invitation.status)}`}>
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Sent on {formatDate(invitation.created_at)}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      {invitation.status === "pending" && (
                        <Button variant="outline" size="sm">
                          Resend Invitation
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        Delete
                      </Button>
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
