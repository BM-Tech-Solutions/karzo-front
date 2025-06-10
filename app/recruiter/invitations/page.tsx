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
import { Textarea } from "@/components/ui/textarea"
import { getInvitations, createInvitation, deleteInvitation, resendInvitation, Invitation as InvitationType } from "@/lib/invitation-service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface JobOffer {
  id: number
  title: string
}

export default function InvitationsPage() {
  const { company } = useCompanyAuth()
  const [invitations, setInvitations] = useState<InvitationType[]>([])
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
      message: "",
    },
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        // Fetch invitations from the API
        const invitationsRes = await getInvitations()
        setInvitations(invitationsRes)
        
        // Fetch job offers from the API
        const jobOffersRes = await fetchWithCompanyAuth(`${API_BASE_URL}/api/job-offers/company/`)
        if (jobOffersRes.ok) {
          const jobOffersData = await jobOffersRes.json()
          setJobOffers(jobOffersData)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load invitations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (values: { email: string; jobOfferId?: number; message?: string }) => {
    setInviteError("")
    setInviteSuccess("")

    try {
      const newInvitation = await createInvitation({
        email: values.email,
        job_offer_id: values.jobOfferId,
        message: values.message
      })

      setInviteSuccess(`Invitation sent to ${values.email}`)
      form.reset()
      setIsDialogOpen(false)

      // Refresh the invitations list
      const updatedInvitations = await getInvitations()
      setInvitations(updatedInvitations)

      toast({
        title: "Success",
        description: `Invitation sent to ${values.email}`,
      })
    } catch (err) {
      setInviteError((err as Error).message)
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      })
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
        <Toaster />
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
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Message (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add a personal message to the invitation email" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
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
                          Position: {invitation.job_title || "No specific position"}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              await resendInvitation(invitation.id);
                              toast({
                                title: "Success",
                                description: `Invitation resent to ${invitation.email}`,
                              });
                              // Refresh invitations
                              const updatedInvitations = await getInvitations();
                              setInvitations(updatedInvitations);
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: `Failed to resend invitation: ${(error as Error).message}`,
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Resend Invitation
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the invitation sent to {invitation.email}.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await deleteInvitation(invitation.id);
                                  toast({
                                    title: "Success",
                                    description: "Invitation deleted successfully",
                                  });
                                  // Remove from local state
                                  setInvitations(invitations.filter(inv => inv.id !== invitation.id));
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: `Failed to delete invitation: ${(error as Error).message}`,
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
