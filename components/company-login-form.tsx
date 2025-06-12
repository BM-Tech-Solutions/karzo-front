"use client"

import { useState } from "react"
import Link from "next/link"
import { useCompanyAuth } from "@/lib/company-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companyLoginSchema } from "@/lib/company-form-schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"

type LoginFormValues = {
  email: string
  password: string
}

export function CompanyLoginForm() {
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { login: loginCompany, isLoading: companyAuthLoading } = useCompanyAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(companyLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setError("")
    setSubmitting(true)

    try {
      await loginCompany(values.email, values.password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  // Use local submitting state instead of the global isLoading state
  const isLoading = submitting || companyAuthLoading

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="recruiter@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <div className="text-sm font-medium text-destructive">{error}</div>}
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </div>
      </form>
    </Form>
  )
}

export function LoginTabs() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Recruiter Login</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <CompanyLoginForm />
      </CardContent>
    </Card>
  )
}
