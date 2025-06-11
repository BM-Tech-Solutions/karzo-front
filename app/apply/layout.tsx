"use client"

import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { CompanyAuthProvider } from "@/lib/company-auth-context"

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CompanyAuthProvider>
        {children}
      </CompanyAuthProvider>
    </AuthProvider>
  )
}
