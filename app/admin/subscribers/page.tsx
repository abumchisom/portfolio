import { SubscribersManager } from "@/components/admin/subscribers-manager"

export default function AdminSubscribersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Newsletter Subscribers</h1>
        <p className="text-muted-foreground">Manage your newsletter subscribers and their preferences.</p>
      </div>
      <SubscribersManager />
    </div>
  )
}
