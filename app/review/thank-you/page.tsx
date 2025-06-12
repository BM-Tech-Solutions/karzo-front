"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your interview has been successfully completed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Your interview is now under review. Our team will evaluate your performance and get back to you soon.
          </p>
          <p className="text-sm text-muted-foreground">
            Thank you for your time and participation in our interview process.
          </p>
        </CardContent>
        {/* No button as requested */}
      </Card>
    </div>
  )
}
