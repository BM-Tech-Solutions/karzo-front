import { Header } from "@/components/header"
import { CompanyRegisterForm } from "@/components/company-register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <CompanyRegisterForm />
      </main>
    </div>
  )
}
