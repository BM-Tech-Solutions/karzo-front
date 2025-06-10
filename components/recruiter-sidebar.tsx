"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCompanyAuth } from "@/lib/company-auth-context"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon?: React.ReactNode
  }[]
}

export function RecruiterSidebar({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const { company, logout } = useCompanyAuth()

  return (
    <div className="h-screen border-r bg-background flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold">
          {company?.name || "Company Portal"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Recruiter Dashboard</p>
      </div>
      <nav className={cn("flex flex-col gap-2 p-4 flex-1", className)} {...props}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={() => logout()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </Button>
      </div>
    </div>
  )
}
