import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

// Remove the Google Font import and use system fonts instead
// import { Inter } from 'next/font/google'
// const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Karzo - AI-Powered Interview Platform",
  description: "Practice and master your interview skills with our AI-powered platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
