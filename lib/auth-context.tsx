"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "candidate" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for saved user and token in localStorage
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("karzo_user")
      const token = localStorage.getItem("karzo_token")
      if (
        savedUser &&
        savedUser !== "undefined" && // <-- Add this check
        token
      ) {
        setUser(JSON.parse(savedUser))
      }
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Login failed")
      }
      const data = await res.json()
      const { access_token, user: userData } = data

      localStorage.setItem("karzo_token", access_token)
      localStorage.setItem("karzo_user", JSON.stringify(userData))
      setUser(userData)

      // Redirect based on role
      if (userData.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: name }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Registration failed")
      }
      // Optionally, auto-login or redirect to login page
      router.push("/login")
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("karzo_user")
      localStorage.removeItem("karzo_token")
    }
    // Remove router.push("/") from here
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


// Helper for authenticated API requests
export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("karzo_token") : null;
  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
  return fetch(input, { ...init, headers });
}
