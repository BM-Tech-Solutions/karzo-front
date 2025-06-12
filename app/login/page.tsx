import { Header } from "@/components/header"
import { LoginTabs } from "@/components/company-login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <LoginTabs />
      </main>
    </div>
  )
}
