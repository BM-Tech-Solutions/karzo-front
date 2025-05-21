import { Header } from "@/components/header"
import { LoginForm } from "@/components/login-form"

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
