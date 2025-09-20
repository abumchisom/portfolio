import { ProjectsManager } from "@/components/admin/projects-manager"

export default function AdminProjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Projects</h1>
        <p className="text-muted-foreground">Manage your technical writing and cybersecurity projects.</p>
      </div>
      <ProjectsManager />
    </div>
  )
}
