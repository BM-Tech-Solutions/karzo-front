"use client"

import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitch } from "@/components/language-switch"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Use useEffect to ensure we're rendering on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check if the current page is admin
  const isAdmin = pathname.startsWith("/admin")

  // Determine if we should show the auth buttons based on the path
  const showAuthButtons = !pathname.includes("/interview/room")

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!isClient) {
    return null // Return null on server-side to prevent hydration mismatch
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">Karzo</span>
          </Link>
          <MainNav />
        </div>
        <div className="flex items-center space-x-2">
          <LanguageSwitch />
          <ModeToggle />
          {showAuthButtons && isClient && (
            <>
              {user ? (
                <Button variant="ghost" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href={isAdmin ? "/admin/login" : "/login"}>Login</Link>
                  </Button>
                  {!isAdmin && (
                    <Button asChild>
                      <Link href="/register">Register</Link>
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
