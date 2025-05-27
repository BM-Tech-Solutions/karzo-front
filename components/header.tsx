"use client"

import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitch } from "@/components/language-switch"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Translation interface
interface Translations {
  welcome: string;
  login: string;
  register: string;
  logout: string;
  dashboard: string;
}

const translations = {
  en: {
    welcome: "Welcome",
    login: "Login", 
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard"
  },
  fr: {
    welcome: "Bienvenue",
    login: "Connexion",
    register: "S'inscrire", 
    logout: "Déconnexion",
    dashboard: "Tableau de bord"
  }
};

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [currentLang, setCurrentLang] = useState<'en' | 'fr'>('en')
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("karzo_language") as 'en' | 'fr' || 'en';
      setCurrentLang(savedLang);
    }
  }, []);

  const t = (key: keyof Translations): string => {
    return translations[currentLang][key];
  };

  const handleLanguageChange = () => {
    const newLang = currentLang === "en" ? "fr" : "en";
    setCurrentLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("karzo_language", newLang);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">Karzo</span>
          </Link>
          <MainNav />
          {user && (
            <Button variant="ghost" asChild className="mr-2">
              <Link href="/dashboard">{t("dashboard")}</Link>
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleLanguageChange}
            className="px-4 py-2"
          >
            {currentLang.toUpperCase()}
          </Button>
          <ModeToggle />
          {pathname && !pathname.includes("/interview/room") && (
            <>
              {user ? (
                <Button variant="ghost" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? t("logout") : t("logout")}
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href={pathname.startsWith("/admin") ? "/admin/login" : "/login"}>{t("login")}</Link>
                  </Button>
                  {!pathname.startsWith("/admin") && (
                    <Button asChild>
                      <Link href="/register">{t("register")}</Link>
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