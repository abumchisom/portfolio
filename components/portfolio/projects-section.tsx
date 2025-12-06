"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Project {
  title: string
  description: string
  technologies: string[]
  category: string
  github_url: string | null
  live_url: string | null
  image_url: string
  featured: boolean
}

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [filter, setFilter] = useState<"all" | "technical-writing" | "cybersecurity">("all")

  const filteredProjects = projects.filter((project) => filter === "all" || project.category === filter)

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Projects</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            A selection of technical writing and cybersecurity projects that showcase my expertise in creating clear
            documentation and implementing robust security solutions.
          </p>

          <div className="flex justify-center gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All Projects
            </Button>
            <Button
              variant={filter === "technical-writing" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("technical-writing")}
            >
              Technical Writing
            </Button>
            <Button
              variant={filter === "cybersecurity" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("cybersecurity")}
            >
              Cybersecurity
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={index}
              className="border border-border/60 rounded-xl bg-background/50 overflow-hidden transition hover:border-primary/50"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={project.image_url || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover rounded-md"
                />
                {project.featured && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">Featured</Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {project.category.replace("-", " ")}
                  </Badge>
                  <div className="flex gap-2">
                    {project.live_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={project.live_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {project.github_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}