import { PortfolioInfoForm } from "@/components/admin/portfolio-info-form"

export default function AdminPortfolioPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Portfolio Information</h1>
        <p className="text-muted-foreground">
          Manage your personal information and contact details displayed on your portfolio.
        </p>
      </div>
      <PortfolioInfoForm />
    </div>
  )
}
