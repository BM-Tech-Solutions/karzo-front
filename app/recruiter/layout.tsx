"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CompanyAuthProvider, useCompanyAuth } from "@/lib/company-auth-context"

// Wrapper component that checks authentication
function RecruiterAuthCheck({ children }: { children: React.ReactNode }) {
  const { company, isLoading } = useCompanyAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !company) {
      router.push("/login")
    }
  }, [company, isLoading, mounted, router])

  if (!mounted || isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!company) {
    return null // Will redirect in the useEffect
  }

  return <>{children}</>
}

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyAuthProvider>
      <RecruiterAuthCheck>
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </RecruiterAuthCheck>
    </CompanyAuthProvider>
  )
}
