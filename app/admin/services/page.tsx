import { ServicesManager } from "@/components/admin/services-manager"

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
        <p className="text-muted-foreground">Manage your service offerings, pricing, and features.</p>
      </div>
      <ServicesManager />
    </div>
  )
}
