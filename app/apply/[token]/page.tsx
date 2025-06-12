"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ApplyRedirect() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string
  
  useEffect(() => {
    if (token) {
      // Redirect to the guest application page with the token
      router.replace(`/guest/apply/${token}`)
    }
  }, [token, router])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Redirecting to application form...</h2>
      </div>
    </div>
  )
}
