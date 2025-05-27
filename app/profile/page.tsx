"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthProvider } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      console.log("User data in profile:", JSON.stringify(user))
      setFullName(user.full_name || "")
      setEmail(user.email || "")
      
      // Check for phone property
      if (user.phone) {
        setPhone(user.phone)
        console.log("Setting phone from user.phone:", user.phone)
      }
      
      // Set resume URL
      if (user.resume_url) {
        setResumeUrl(user.resume_url)
        console.log("Setting resume URL from user.resume_url:", user.resume_url)
      }
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName || !email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get the resume file
      const resumeInput = document.getElementById('resume') as HTMLInputElement
      const resumeFile = resumeInput.files?.[0]
      
      // Create form data for the API call
      const formData = new FormData()
      formData.append('full_name', fullName)
      if (phone) formData.append('phone', phone)
      if (resumeFile) formData.append('resume', resumeFile)
      
      // Update the candidate profile
      if (user) {
        const token = localStorage.getItem('karzo_token')
        const response = await fetch(`http://localhost:8000/api/candidates/${user.id}/update-profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        if (response.ok) {
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully",
          })
        } else {
          throw new Error("Failed to update profile")
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Your Profile</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      disabled 
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume</Label>
                    <Input id="resume" type="file" />
                    <p className="text-sm text-muted-foreground">Upload your resume (PDF, DOC, or DOCX)</p>
                    {resumeUrl && (
                      <p className="text-sm text-green-600">
                        Current resume: {resumeUrl.split('/').pop()}
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Back to Dashboard
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
