"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2 } from "lucide-react"
import type { Project } from "@/lib/types"

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to load projects.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (projectData: Partial<Project>) => {
    try {
      if (editingProject?.id) {
        const { error } = await supabase
          .from("projects")
          .update({ ...projectData, updated_at: new Date().toISOString() })
          .eq("id", editingProject.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("projects").insert(projectData)
        if (error) throw error
      }

      toast({ title: "Success", description: `Project ${editingProject?.id ? "updated" : "created"}!` })
      setIsFormOpen(false)
      setEditingProject(null)
      loadProjects()
    } catch {
      toast({ title: "Error", description: "Failed to save project.", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Success", description: "Project deleted!" })
      loadProjects()
    } catch {
      toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Projects ({projects.length})</h1>
          <Button
            onClick={() => {
              setEditingProject({})
              setIsFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {isFormOpen && (
          <ProjectForm
            project={editingProject}
            onSave={handleSave}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingProject(null)
            }}
          />
        )}

        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-border rounded-lg p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium truncate">{project.title}</h3>
                    {project.featured && <Badge>Featured</Badge>}
                    <Badge variant="outline" className="capitalize text-xs">
                      {project.category.replace("-", " ")}
                    </Badge>
                    <Badge variant={project.status === "published" ? "default" : "secondary"} className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 sm:flex-col lg:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProject(project)
                      setIsFormOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No projects yet. Create your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Partial<Project> | null
  onSave: (data: Partial<Project>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<Project>>(
    project || {
      title: "",
      description: "",
      content: "",
      category: "technical-writing",
      featured: false,
      status: "draft",
      technologies: [],
      project_url: "",
      github_url: "",
    }
  )

  const handleTechChange = (value: string) => {
    const techs = value.split(",").map((t) => t.trim()).filter(Boolean)
    setFormData((prev) => ({ ...prev, technologies: techs }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="border border-border rounded-lg">
      <div className="p-5 border-b border-border">
        <h2 className="font-medium">{project?.id ? "Edit Project" : "Add New Project"}</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData((p) => ({ ...p, category: v as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical-writing">Technical Writing</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={2}
            value={formData.description || ""}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            rows={5}
            value={formData.content || ""}
            onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="project_url">Project URL</Label>
            <Input
              id="project_url"
              placeholder="https://..."
              value={formData.project_url || ""}
              onChange={(e) => setFormData((p) => ({ ...p, project_url: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              placeholder="https://github.com/..."
              value={formData.github_url || ""}
              onChange={(e) => setFormData((p) => ({ ...p, github_url: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tech">Technologies (comma-separated)</Label>
          <Input
            id="tech"
            placeholder="React, Next.js, TypeScript"
            value={formData.technologies?.join(", ") || ""}
            onChange={(e) => handleTechChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.featured || false}
                onCheckedChange={(c) => setFormData((p) => ({ ...p, featured: c }))}
              />
              <Label className="cursor-pointer">Featured</Label>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData((p) => ({ ...p, status: v as any }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Project</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}