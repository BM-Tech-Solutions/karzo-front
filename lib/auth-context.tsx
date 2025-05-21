"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Mock user data types
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

// Mock users for testing
const mockUsers: User[] = [
  {
    id: "1",
    email: "candidate@example.com",
    name: "John Doe",
    role: "candidate",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for saved user in localStorage
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("karzo_user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const foundUser = mockUsers.find((u) => u.email === email)

      if (foundUser) {
        setUser(foundUser)
        localStorage.setItem("karzo_user", JSON.stringify(foundUser))

        // Redirect based on role
        if (foundUser.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      if (mockUsers.some((u) => u.email === email)) {
        throw new Error("User already exists")
      }

      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        email,
        name,
        role: "candidate",
        profilePicture: "/placeholder.svg?height=200&width=200",
      }

      // In a real app, we would save this to the backend
      mockUsers.push(newUser)

      // Changed: Redirect to login page instead of dashboard
      router.push("/login")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Updated logout function to be async
  const logout = async () => {
    try {
      // Clear user state
      setUser(null)

      // Clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("karzo_user")
      }

      // Add a small delay to ensure state updates before navigation
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Navigate to home page
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
