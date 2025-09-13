"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CheckCircle2 } from "lucide-react"
import {
  companyForgotPasswordRequest,
  companyForgotPasswordVerify,
  companyForgotPasswordReset,
} from "@/lib/api-service"

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

const codeSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
})

const resetSchema = z
  .object({
    email: z.string().email(),
    code: z.string().min(6).max(6),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(8),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  })

type Step = "email" | "code" | "reset" | "done"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { email: "", code: "" },
  })

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "", code: "", password: "", confirm: "" },
  })

  const submitEmail = async (values: z.infer<typeof emailSchema>) => {
    setError("")
    setIsLoading(true)
    try {
      await companyForgotPasswordRequest(values.email)
      // propagate email to next forms
      codeForm.setValue("email", values.email)
      resetForm.setValue("email", values.email)
      setStep("code")
    } catch (e: any) {
      setError(e?.message || "Failed to send code")
    } finally {
      setIsLoading(false)
    }
  }

  const submitCode = async (values: z.infer<typeof codeSchema>) => {
    setError("")
    setIsLoading(true)
    try {
      await companyForgotPasswordVerify(values.email, values.code)
      // propagate code to reset form
      resetForm.setValue("code", values.code)
      setStep("reset")
    } catch (e: any) {
      setError(e?.message || "Invalid or expired code")
    } finally {
      setIsLoading(false)
    }
  }

  const submitReset = async (values: z.infer<typeof resetSchema>) => {
    setError("")
    setIsLoading(true)
    try {
      await companyForgotPasswordReset(values.email, values.code, values.password)
      setStep("done")
    } catch (e: any) {
      setError(e?.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                {step === "email" && "Enter your company email to receive a 6-digit code"}
                {step === "code" && "Enter the 6-digit code we sent to your email"}
                {step === "reset" && "Enter your new password"}
                {step === "done" && "Your password has been reset successfully"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && <div className="text-sm font-medium text-destructive mb-2">{error}</div>}
              {step === "email" && (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(submitEmail)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send code"}
                    </Button>
                  </form>
                </Form>
              )}

              {step === "code" && (
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(submitCode)} className="space-y-4">
                    <FormField
                      control={codeForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={codeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input placeholder="123456" maxLength={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep("email")}>Back</Button>
                      <Button type="submit" className="w-2/3" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify code"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {step === "reset" && (
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(submitReset)} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input placeholder="123456" maxLength={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetForm.control}
                      name="confirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep("code")}>Back</Button>
                      <Button type="submit" className="w-2/3" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Reset password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {step === "done" && (
                <div className="text-center py-4 space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium">Password updated</h3>
                  <p className="text-muted-foreground">You can now log in with your new password.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                {step === "done" ? (
                  <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                    Go to login
                  </Link>
                ) : (
                  <>
                    Remember your password?{" "}
                    <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                      Back to login
                    </Link>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </AuthProvider>
  )
}
