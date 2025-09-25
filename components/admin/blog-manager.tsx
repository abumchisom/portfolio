"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import type { Blog } from "@/lib/types"

export function BlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadBlogs()
  }, [])

  const loadBlogs = async () => {
    try {
      const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error("Error loading blogs:", error)
      toast({
        title: "Error",
        description: "Failed to load blog posts.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleSave = async (blogData: Partial<Blog>) => {
    try {
      // Generate slug if not provided
      if (blogData.title && !blogData.slug) {
        blogData.slug = generateSlug(blogData.title)
      }

      // Set published_at if publishing
      if (blogData.status === "published" && !blogData.published_at) {
        blogData.published_at = new Date().toISOString()
      }

      if (editingBlog?.id) {
        // Update existing blog
        const { error } = await supabase
          .from("blogs")
          .update({
            ...blogData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingBlog.id)

        if (error) throw error
      } else {
        // Create new blog
        const { error } = await supabase.from("blogs").insert(blogData)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Blog post ${editingBlog?.id ? "updated" : "created"} successfully!`,
      })

      setIsFormOpen(false)
      setEditingBlog(null)
      loadBlogs()
    } catch (error) {
      console.error("Error saving blog:", error)
      toast({
        title: "Error",
        description: "Failed to save blog post.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Blog post deleted successfully!",
      })

      loadBlogs()
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog post.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading blog posts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blog Posts ({blogs.length})</h2>
        </div>
        <Button
          onClick={() => {
            setEditingBlog({})
            setIsFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Blog Post
        </Button>
      </div>

      {isFormOpen && (
        <BlogForm
          blog={editingBlog}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingBlog(null)
          }}
        />
      )}

      <div className="grid gap-4">
        {blogs.map((blog) => (
          <Card key={blog.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{blog.title}</CardTitle>
                    {blog.featured && <Badge>Featured</Badge>}
                    {blog.category && <Badge variant="outline">{blog.category}</Badge>}
                    <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
                  </div>
                  <CardDescription>{blog.excerpt}</CardDescription>
                  {blog.published_at && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(blog.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingBlog(blog)
                      setIsFormOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(blog.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {blog.tags && blog.tags.length > 0 && (
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {blog.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {blogs.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function BlogForm({
  blog,
  onSave,
  onCancel,
}: {
  blog: Partial<Blog> | null
  onSave: (blog: Partial<Blog>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<Blog>>(
    blog || {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      featured: false,
      status: "draft",
      tags: [],
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    setFormData({ ...formData, tags })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{blog?.id ? "Edit Blog Post" : "Add New Blog Post"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Blog post title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="auto-generated-from-title"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="A brief summary of the blog post"
              value={formData.excerpt || ""}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your blog post content here"
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Technical Writing, Cybersecurity, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="documentation, security, best practices"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Blog["status"] })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Blog Post</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
