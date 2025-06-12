"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function MainNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Define routes with their visibility conditions
  interface Route {
    href: string;
    label: string;
    active: boolean;
  }
  
  const routes: Route[] = [
    // Home and Jobs links removed as requested
  ]

  // Don't render navigation items until client-side
  if (!mounted) {
    return <nav className="flex items-center space-x-4 lg:space-x-6"></nav>
  }

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
