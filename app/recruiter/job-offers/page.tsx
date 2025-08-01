"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompanyAuth, fetchWithCompanyAuth } from "@/lib/company-auth-context"
import { API_BASE_URL } from "@/lib/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface JobOffer {
  id: number
  title: string
  description: string
  created_at: string
  status: "active" | "inactive" | "draft"
  applications_count: number
}

export default function JobOffersPage() {
  const { company } = useCompanyAuth()
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  
  // Form schema for editing job offers
  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
  })
  
  // Form for editing job offers
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })
  
  // Invite form schema
  const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    // External company fields
    isExternalCompany: z.boolean().optional(),
    externalCompanyName: z.string().optional(),
    externalCompanyEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    externalCompanySize: z.string().optional(),
    externalCompanySector: z.string().optional(),
    externalCompanyAbout: z.string().optional(),
    externalCompanyWebsite: z.string().url("Invalid URL").optional().or(z.literal("")),
  }).refine((data) => {
    // If external company is selected, name is required
    if (data.isExternalCompany && !data.externalCompanyName) {
      return false;
    }
    return true;
  }, {
    message: "Company name is required when inviting for external company",
    path: ["externalCompanyName"],
  })
  
  // Form for inviting candidates
  type InviteFormData = z.infer<typeof inviteSchema>
  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      isExternalCompany: false,
      externalCompanyName: "",
      externalCompanyEmail: "",
      externalCompanySize: "",
      externalCompanySector: "",
      externalCompanyAbout: "",
      externalCompanyWebsite: "",
    },
  })

  const fetchJobOffers = async () => {
    try {
      setIsLoading(true)
      // Fetch job offers from the backend API
      const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/job-offers/company`)
      if (response.ok) {
        const data = await response.json()
        setJobOffers(data)
      } else {
        console.error("Failed to fetch job offers:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch job offers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobOffers()
  }, [])
  
  // Function to toggle job offer status (active/inactive)
  // Open view details modal
  const handleViewDetails = (job: JobOffer) => {
    setSelectedJob(job)
    setViewDetailsOpen(true)
  }

  // Open edit modal and populate form
  const handleEdit = (job: JobOffer) => {
    setSelectedJob(job)
    form.reset({
      title: job.title,
      description: job.description,
    })
    setEditModalOpen(true)
  }

  // Open invite candidates modal
  const handleInvite = (job: JobOffer) => {
    setSelectedJob(job)
    inviteForm.reset()
    setInviteModalOpen(true)
  }

  // Submit edit form
  const onSubmitEdit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedJob) return
    
    try {
      setIsUpdating(true)
      const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/job-offers/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
        }),
      })
      
      if (response.ok) {
        // Update the local state
        setJobOffers(prevOffers => 
          prevOffers.map(job => 
            job.id === selectedJob.id ? { ...job, title: values.title, description: values.description } : job
          )
        )
        setEditModalOpen(false)
      } else {
        console.error("Failed to update job offer:", response.statusText)
        alert("Failed to update job offer. Please try again.")
      }
    } catch (error) {
      console.error("Error updating job offer:", error)
      alert("An error occurred while updating the job offer.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Submit invite form
  const onSubmitInvite = async (values: z.infer<typeof inviteSchema>) => {
    if (!selectedJob) return
    
    try {
      setIsUpdating(true)
      const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/invitations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          job_offer_id: selectedJob.id,
          // Add external company data if selected
          ...(values.isExternalCompany && {
            external_company_name: values.externalCompanyName,
            ...(values.externalCompanyEmail && { external_company_email: values.externalCompanyEmail }),
            ...(values.externalCompanySize && { external_company_size: values.externalCompanySize }),
            ...(values.externalCompanySector && { external_company_sector: values.externalCompanySector }),
            ...(values.externalCompanyAbout && { external_company_about: values.externalCompanyAbout }),
            ...(values.externalCompanyWebsite && { external_company_website: values.externalCompanyWebsite })
          })
        }),
      })
      
      if (response.ok) {
        setInviteModalOpen(false)
        alert("Invitation sent successfully!")
      } else {
        console.error("Failed to send invitation:", response.statusText)
        alert("Failed to send invitation. Please try again.")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      alert("An error occurred while sending the invitation.")
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleJobStatus = async (jobId: number, currentStatus: string) => {
    try {
      setIsUpdating(true)
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      
      const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/job-offers/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: newStatus === "active"
        }),
      })
      
      if (response.ok) {
        // Update the local state to reflect the change
        setJobOffers(prevOffers => 
          prevOffers.map(job => 
            job.id === jobId ? { ...job, status: newStatus, is_active: newStatus === "active" } : job
          )
        )
      } else {
        console.error("Failed to update job status:", response.statusText)
        alert("Failed to update job status. Please try again.")
      }
    } catch (error) {
      console.error("Error updating job status:", error)
      alert("An error occurred while updating the job status.")
    } finally {
      setIsUpdating(false)
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

  const filteredJobOffers = jobOffers.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusBadgeClass = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen">
      <RecruiterSidebar items={sidebarItems} className="w-64" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Job Offers</h1>
            <Link href="/recruiter/job-offers/new">
              <Button>
                Create Job Offer
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search job offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading job offers...</p>
            </div>
          ) : filteredJobOffers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No job offers found</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobOffers.map((job) => (
                <Card key={job.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Posted on {formatDate(job.created_at)}
                        </CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
                        {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Active'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                    <p className="text-sm">
                      <span className="font-medium">{job.applications_count}</span> applications received
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(job)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(job)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      {job.status === "active" ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => toggleJobStatus(job.id, job.status)}
                          disabled={isUpdating}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-500 hover:text-green-700"
                          onClick={() => toggleJobStatus(job.id, job.status)}
                          disabled={isUpdating}
                        >
                          Activate
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleInvite(job)}
                      >
                        Invite Candidates
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* View Details Modal */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title || "Job Details"}</DialogTitle>
            <DialogDescription>
              {selectedJob ? `Posted on ${formatDate(selectedJob.created_at)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{selectedJob?.description || "No description available"}</p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedJob ? getStatusBadgeClass(selectedJob.status) : "bg-gray-100 text-gray-800"}`}>
                {selectedJob?.status ? selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1) : "Active"}
              </span>
            </div>
            <div>
              <h3 className="font-medium">Applications</h3>
              <p className="text-sm">{selectedJob?.applications_count || 0} applications received</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job Offer</DialogTitle>
            <DialogDescription>
              Make changes to the job offer details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Job description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invite Candidates Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invite Candidates</DialogTitle>
            <DialogDescription>
              Send an invitation to a candidate for {selectedJob?.title || "this job offer"}.
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onSubmitInvite)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="candidate@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* External Company Section */}
              <FormField
                control={inviteForm.control}
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
              {inviteForm.watch("isExternalCompany") && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                  <h4 className="font-medium text-sm">External Company Information</h4>
                  
                  <FormField
                    control={inviteForm.control}
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
                    control={inviteForm.control}
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
                      control={inviteForm.control}
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
                      control={inviteForm.control}
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
                    control={inviteForm.control}
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
                    control={inviteForm.control}
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>Send Invitation</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
