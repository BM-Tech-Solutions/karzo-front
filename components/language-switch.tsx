"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Define available languages (only English and French)
const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
]

export function LanguageSwitch() {
  const [mounted, setMounted] = useState(false)
  const [currentLang, setCurrentLang] = useState("en")

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true)
    // Get language from localStorage if available
    const savedLang = localStorage.getItem("karzo_language") || "en"
    if (languages.some((lang) => lang.code === savedLang)) {
      setCurrentLang(savedLang)
    }
  }, [])

  const setLanguage = (code: string) => {
    console.log("Setting language to:", code)
    setCurrentLang(code)
    localStorage.setItem("karzo_language", code)
    // Reload the page to apply the language change
    window.location.reload()
  }

  // Don't render until client-side
  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={currentLang === lang.code ? "bg-muted" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
