"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "candidate" | "admin"

export interface User {
  id: string
  email: string
  full_name: string  // Changed from 'name' to 'full_name' to match backend
  phone: string
  role: UserRole
  resume_url: string
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
    async function validateToken() {
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("karzo_user")
        const token = localStorage.getItem("karzo_token")
        
        if (savedUser && savedUser !== "undefined" && token) {
          try {
            // Validate token with backend
            const response = await fetch(`${API_URL}/validate-token`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            });
            
            if (response.ok) {
              // Token is valid, set the user
              setUser(JSON.parse(savedUser));
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem("karzo_user");
              localStorage.removeItem("karzo_token");
            }
          } catch (error) {
            // If there's an error, clear the invalid data
            localStorage.removeItem("karzo_user");
            localStorage.removeItem("karzo_token");
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
