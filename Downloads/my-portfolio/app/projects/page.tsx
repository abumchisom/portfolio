import { ProjectsList } from "@/components/projects/projects-list"
import { Navigation } from "@/components/portfolio/navigation"

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Projects</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive showcase of technical writing and cybersecurity projects that demonstrate expertise in
              creating clear documentation and implementing robust security solutions.
            </p>
          </div>
          <ProjectsList />
        </div>
      </main>
    </div>
  )
}
