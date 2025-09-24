import { Suspense } from "react"
import { NewsletterManager } from "@/components/admin/newsletter-manager"

export default function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Newsletter Management</h1>
        <p className="text-muted-foreground">Create, send, and manage your newsletters</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <NewsletterManager />
      </Suspense>
    </div>
  )
}
