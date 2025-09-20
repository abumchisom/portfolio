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
    content:
      "Created a complete API documentation portal for a fintech startup, featuring interactive examples, code snippets in multiple languages, and comprehensive guides for developers. The portal reduced developer onboarding time by 60% and significantly improved API adoption rates.",
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
    content:
      "Conducted a comprehensive security assessment for a major e-commerce platform, identifying 15 critical vulnerabilities and providing detailed remediation strategies. The assessment covered web application security, infrastructure security, and compliance requirements.",
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
    content:
      "Designed and wrote a comprehensive developer onboarding guide for a SaaS platform, including interactive tutorials, code examples, and troubleshooting guides. The guide reduced support tickets by 40% and improved developer satisfaction scores.",
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
    content:
      "Designed and implemented a comprehensive network security solution including firewall configuration, intrusion detection systems, and security monitoring. The implementation resulted in zero security incidents over 18 months.",
    category: "cybersecurity",
    featured: false,
    image: "/network-security-dashboard.png",
    projectUrl: null,
    githubUrl: null,
    technologies: ["pfSense", "Suricata", "ELK Stack", "Network Security", "Monitoring"],
  },
]

export function ProjectsList() {
  const [filter, setFilter] = useState<"all" | "technical-writing" | "cybersecurity">("all")

  const filteredProjects = projects.filter((project) => filter === "all" || project.category === filter)

  return (
    <div className="space-y-8">
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

      <div className="grid gap-8">
        {filteredProjects.map((project, index) => (
          <Card key={index} className="bg-card border-border overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <div className="relative aspect-video md:aspect-square overflow-hidden">
                  <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
                  {project.featured && (
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">Featured</Badge>
                  )}
                </div>
              </div>
              <div className="md:w-2/3">
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
                  <CardDescription className="text-muted-foreground mb-4">{project.description}</CardDescription>
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.content}</p>
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
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
