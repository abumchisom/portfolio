"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const projects = [
  {
    title: "API Documentation Portal",
    description:
      "Comprehensive API documentation portal built with modern documentation tools and interactive examples.",
    category: "technical-writing",
    featured: true,
    image: "/api-documentation-portal-interface.jpg",
    projectUrl: "https://api-docs.example.com",
    githubUrl: "https://github.com/example/api-docs",
    technologies: ["GitBook", "OpenAPI", "Markdown", "JavaScript", "React"],
  },
  {
    title: "Security Vulnerability Assessment",
    description: "Complete security assessment of a e-commerce platform identifying critical vulnerabilities.",
    category: "cybersecurity",
    featured: true,
    image: "/cybersecurity-vulnerability-assessment-dashboard.jpg",
    projectUrl: null,
    githubUrl: null,
    technologies: ["OWASP", "Burp Suite", "Nmap", "Python", "Security Testing"],
  },
  {
    title: "Developer Onboarding Guide",
    description: "Interactive developer onboarding documentation with step-by-step tutorials and code examples.",
    category: "technical-writing",
    featured: false,
    image: "/developer-onboarding-guide-interface.jpg",
    projectUrl: "https://docs.example.com/onboarding",
    githubUrl: null,
    technologies: ["Notion", "Markdown", "Figma", "Technical Writing"],
  },
  {
    title: "Network Security Implementation",
    description: "Implementation of enterprise-grade network security solutions for a mid-size company.",
    category: "cybersecurity",
    featured: false,
    image: "/network-security-dashboard.png",
    projectUrl: null,
    githubUrl: null,
    technologies: ["pfSense", "Suricata", "ELK Stack", "Network Security", "Monitoring"],
  },
]

export function ProjectsSection() {
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
            <Card key={index} className="bg-card border-border overflow-hidden group">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {project.featured && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">Featured</Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {project.category.replace("-", " ")}
                  </Badge>
                  <div className="flex gap-2">
                    {project.projectUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
