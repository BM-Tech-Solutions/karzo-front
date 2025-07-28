"use client"

import { useState, useEffect } from "react"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
      isExternalCompany: false,
      externalCompanyName: "",
      externalCompanyEmail: "",
      externalCompanySize: "",
      externalCompanySector: "",
      externalCompanyAbout: "",
      externalCompanyWebsite: "",
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

  const onSubmit = async (values: any) => {
    setInviteError("")
    setInviteSuccess("")

    try {
      const invitationData: any = {
        email: values.email,
        job_offer_id: values.jobOfferId,
        message: values.message
      }

      // Add external company data if selected
      if (values.isExternalCompany) {
        invitationData.external_company_name = values.externalCompanyName
        if (values.externalCompanyEmail) invitationData.external_company_email = values.externalCompanyEmail
        if (values.externalCompanySize) invitationData.external_company_size = values.externalCompanySize
        if (values.externalCompanySector) invitationData.external_company_sector = values.externalCompanySector
        if (values.externalCompanyAbout) invitationData.external_company_about = values.externalCompanyAbout
        if (values.externalCompanyWebsite) invitationData.external_company_website = values.externalCompanyWebsite
      }

      const newInvitation = await createInvitation(invitationData)

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
      href: "/recruiter/reports",
      title: "Reports",
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
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                    
                    {/* External Company Section */}
                    <FormField
                      control={form.control}
                      name="isExternalCompany"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Invite for another company
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Check this if you're inviting a candidate on behalf of a different company
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* External Company Fields - Only show when checkbox is checked */}
                    {form.watch("isExternalCompany") && (
                      <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                        <h4 className="font-medium text-sm">External Company Information</h4>
                        
                        <FormField
                          control={form.control}
                          name="externalCompanyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="externalCompanyEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Email</FormLabel>
                              <FormControl>
                                <Input placeholder="company@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="externalCompanySize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Size</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1-10">1-10 employees</SelectItem>
                                    <SelectItem value="11-50">11-50 employees</SelectItem>
                                    <SelectItem value="51-200">51-200 employees</SelectItem>
                                    <SelectItem value="201-500">201-500 employees</SelectItem>
                                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                                    <SelectItem value="1000+">1000+ employees</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="externalCompanySector"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Technology, Finance" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="externalCompanyWebsite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://company.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="externalCompanyAbout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>About Company</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description of the company" 
                                  className="resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
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
