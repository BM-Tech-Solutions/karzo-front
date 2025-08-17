"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from './config'

export interface Company {
  id: string
  name: string
  email: string
  size?: string
  sector?: string
  about?: string
  website?: string
  api_key?: string | null
}

interface CompanyAuthContextType {
  company: Company | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (companyData: {
    name: string
    email: string
    password: string
    size?: string
    sector?: string
    about?: string
    website?: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const CompanyAuthContext = createContext<CompanyAuthContextType | undefined>(undefined)

const COMPANY_API_URL = `${API_BASE_URL}/api/company`

export function CompanyAuthProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for saved company and token in localStorage
    async function validateToken() {
      if (typeof window !== "undefined") {
        const savedCompany = localStorage.getItem("karzo_company")
        const token = localStorage.getItem("karzo_company_token")
        
        if (savedCompany && savedCompany !== "undefined" && token) {
          try {
            console.log("Attempting to validate token...")
            // Validate token with backend
            const response = await fetch(`${COMPANY_API_URL}/validate-token/`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            });
            
            if (response.ok) {
              console.log("Token validation successful")
              // Token is valid, set the company
              setCompany(JSON.parse(savedCompany));
            } else {
              console.error("Token validation failed:", response.status, response.statusText)
              // If we get a 401 Unauthorized, the token is expired or invalid
              if (response.status === 401) {
                console.log("Token expired or invalid, logging out")
                // Token is invalid, clear storage
                localStorage.removeItem("karzo_company");
                localStorage.removeItem("karzo_company_token");
                // Redirect to login page
                router.push("/login");
              }
            }
          } catch (error) {
            console.error("Error during token validation:", error)
            // If there's an error, clear the invalid data
            localStorage.removeItem("karzo_company");
            localStorage.removeItem("karzo_company_token");
            // Redirect to login page
            router.push("/login");
          }
        } else {
          console.log("No saved company or token found")
          // If we're on a protected route, redirect to login
          if (window.location.pathname.startsWith("/recruiter")) {
            router.push("/login");
          }
        }
        setIsLoading(false);
      }
    }
    
    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${COMPANY_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Login failed")
      }
      const data = await res.json()
      const { access_token, company: companyData } = data

      localStorage.setItem("karzo_company_token", access_token)
      localStorage.setItem("karzo_company", JSON.stringify(companyData))
      setCompany(companyData)

      // Redirect to recruiter dashboard
      router.push("/recruiter/dashboard")
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (companyData: {
    name: string
    email: string
    password: string
    size?: string
    sector?: string
    about?: string
    website?: string
  }) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${COMPANY_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Registration failed")
      }
      // Redirect to login page after successful registration
      router.push("/login")
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setCompany(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("karzo_company")
      localStorage.removeItem("karzo_company_token")
    }
    router.push("/login")
  }

  return (
    <CompanyAuthContext.Provider value={{ company, isLoading, login, register, logout }}>
      {children}
    </CompanyAuthContext.Provider>
  )
}

export function useCompanyAuth() {
  const context = useContext(CompanyAuthContext)
  if (context === undefined) {
    throw new Error("useCompanyAuth must be used within a CompanyAuthProvider")
  }
  return context
}

// Helper for authenticated API requests
export async function fetchWithCompanyAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("karzo_company_token") : null;
  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
  return fetch(input, { ...init, headers });
}
