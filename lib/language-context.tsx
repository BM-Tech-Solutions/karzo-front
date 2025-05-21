"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define available languages
export const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
]

// Simple translations for demonstration
const translations = {
  en: {
    welcome: "Welcome",
    dashboard: "Dashboard",
    interviews: "Interviews",
    profile: "Profile",
    login: "Login",
    register: "Register",
    logout: "Logout",
  },
  es: {
    welcome: "Bienvenido",
    dashboard: "Panel",
    interviews: "Entrevistas",
    profile: "Perfil",
    login: "Iniciar sesión",
    register: "Registrarse",
    logout: "Cerrar sesión",
  },
  fr: {
    welcome: "Bienvenue",
    dashboard: "Tableau de bord",
    interviews: "Entretiens",
    profile: "Profil",
    login: "Connexion",
    register: "S'inscrire",
    logout: "Déconnexion",
  },
  de: {
    welcome: "Willkommen",
    dashboard: "Dashboard",
    interviews: "Interviews",
    profile: "Profil",
    login: "Anmelden",
    register: "Registrieren",
    logout: "Abmelden",
  },
}

type TranslationKey = keyof typeof translations.en
type LanguageCode = keyof typeof translations

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (code: LanguageCode) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = (localStorage.getItem("karzo_language") || "en") as LanguageCode
    if (Object.keys(translations).includes(savedLang)) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code)
    localStorage.setItem("karzo_language", code)
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  // Avoid hydration mismatch by only rendering when mounted
  if (!mounted) {
    return <>{children}</>
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
