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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Company Login</CardTitle>
        <CardDescription>Enter your company credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="company@example.com" {...field} />
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </div>
        <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
          Forgot password?
        </Link>
      </CardFooter>
    </Card>
  )
}

export function LoginTabs() {
  const [activeTab, setActiveTab] = useState("company")
  const { login: loginCandidate } = useAuth()
  const { login: loginCompany } = useCompanyAuth()
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">Choose your account type to login</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="company" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="candidate">Candidate</TabsTrigger>
          </TabsList>
          <TabsContent value="company">
            <CompanyLoginForm />
          </TabsContent>
          <TabsContent value="candidate">
            <div className="pt-4">
              <Form {...useForm({
                resolver: zodResolver(companyLoginSchema),
                defaultValues: { email: "", password: "" },
              })}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const email = formData.get('email') as string;
                  const password = formData.get('password') as string;
                  loginCandidate(email, password);
                }} className="space-y-4">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input name="email" placeholder="candidate@example.com" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input name="password" type="password" />
                    </FormControl>
                  </FormItem>
                  <Button type="submit" className="w-full">Login as Candidate</Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
