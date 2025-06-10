import { Loader2 } from "lucide-react"
import { Header } from "@/components/header"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading invitation...</h2>
        </div>
      </main>
    </div>
  )
}
