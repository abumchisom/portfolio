"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Save, Clock, Hash, FileText, Settings, Trash2 } from "lucide-react"
import type { Blog } from "@/lib/types"

export function BlogEditor() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [draftBlogs, setDraftBlogs] = useState<Blog[]>([])
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([])
  const [selectedBlog, setSelectedBlog] = useState<Partial<Blog> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadBlogs()
  }, [])

  useEffect(() => {
    // Separate blogs by status
    setDraftBlogs(blogs.filter((blog) => blog.status === "draft"))
    setPublishedBlogs(blogs.filter((blog) => blog.status === "published"))
  }, [blogs])

  const loadBlogs = async () => {
    try {
      const { data, error } = await supabase.from("blogs").select("*").order("updated_at", { ascending: false })

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

  const calculateReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    return Math.ceil(words / 200)
  }

  const countWords = (content: string) => {
    return content
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  const countParagraphs = (content: string) => {
    return content.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
  }

  const handleSave = async (blogData: Partial<Blog>, publish = false) => {
    setIsSaving(true)
    try {
      // Generate slug if not provided
      if (blogData.title && !blogData.slug) {
        blogData.slug = generateSlug(blogData.title)
      }

      // Set status
      if (publish) {
        blogData.status = "published"
        blogData.published_at = new Date().toISOString()
      } else {
        blogData.status = "draft"
      }

      if (selectedBlog?.id) {
        // Update existing blog
        const { error } = await supabase
          .from("blogs")
          .update({
            ...blogData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedBlog.id)

        if (error) throw error
      } else {
        // Create new blog
        const { data, error } = await supabase.from("blogs").insert(blogData).select().single()

        if (error) throw error
        setSelectedBlog(data)
      }

      toast({
        title: "Success",
        description: `Blog post ${publish ? "published" : "saved as draft"} successfully!`,
      })

      loadBlogs()
      setShowSettings(false)
    } catch (error) {
      console.error("Error saving blog:", error)
      toast({
        title: "Error",
        description: "Failed to save blog post.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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

      if (selectedBlog?.id === id) {
        setSelectedBlog(null)
      }
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

  const createNewBlog = () => {
    setSelectedBlog({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      featured: false,
      status: "draft",
      tags: [],
    })
  }

  if (isLoading) {
    return <div>Loading blog editor...</div>
  }

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Left Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        <Button onClick={createNewBlog} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Blog Post
        </Button>

        {/* Draft Blogs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Draft Posts ({draftBlogs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {draftBlogs.map((blog) => (
              <div
                key={blog.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedBlog?.id === blog.id ? "bg-muted border-primary" : "bg-card"
                }`}
                onClick={() => setSelectedBlog(blog)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm line-clamp-1">{blog.title || "Untitled"}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(blog.id)
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{blog.excerpt || "No excerpt"}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(blog.updated_at).toLocaleDateString()}
                  </span>
                  {blog.featured && (
                    <Badge variant="secondary" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {draftBlogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No draft posts</p>
            )}
          </CardContent>
        </Card>

        {/* Published Blogs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Published Posts ({publishedBlogs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {publishedBlogs.map((blog) => (
              <div
                key={blog.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedBlog?.id === blog.id ? "bg-muted border-primary" : "bg-card"
                }`}
                onClick={() => setSelectedBlog(blog)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm line-clamp-1">{blog.title}</h4>
                  <Badge className="text-xs">Published</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ""}
                  </span>
                  {blog.featured && (
                    <Badge variant="secondary" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {publishedBlogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No published posts</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedBlog ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Input
                  value={selectedBlog.title || ""}
                  onChange={(e) => setSelectedBlog({ ...selectedBlog, title: e.target.value })}
                  placeholder="Blog post title..."
                  className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSave(selectedBlog)} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <BlogSettingsDialog
                    blog={selectedBlog}
                    onSave={handleSave}
                    onClose={() => setShowSettings(false)}
                    isSaving={isSaving}
                  />
                </Dialog>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="flex-1">
              <RichTextEditor
                value={selectedBlog.content || ""}
                onChange={(content) => setSelectedBlog({ ...selectedBlog, content })}
                placeholder="Start writing your blog post..."
                className="h-full"
                showImageUpload={true}
                onImageUpload={async (file) => {
                  // TODO: Implement image upload to storage
                  return URL.createObjectURL(file)
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No blog post selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a blog post from the sidebar or create a new one to start editing.
              </p>
              <Button onClick={createNewBlog}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BlogSettingsDialog({
  blog,
  onSave,
  onClose,
  isSaving,
}: {
  blog: Partial<Blog>
  onSave: (blog: Partial<Blog>, publish?: boolean) => void
  onClose: () => void
  isSaving: boolean
}) {
  const [formData, setFormData] = useState(blog)

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    setFormData({ ...formData, tags })
  }

  const wordCount = formData.content ? countWords(formData.content) : 0
  const paragraphCount = formData.content ? countParagraphs(formData.content) : 0
  const readingTime = formData.content ? calculateReadingTime(formData.content) : 0

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Blog Post Settings</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{wordCount}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{paragraphCount}</div>
              <div className="text-xs text-muted-foreground">Paragraphs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{readingTime}</div>
              <div className="text-xs text-muted-foreground">Min Read</div>
            </CardContent>
          </Card>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={formData.slug || ""}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated-from-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt || ""}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Brief description of your blog post..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Featured Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url || ""}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured || false}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
            <Label htmlFor="featured">Featured Post</Label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onSave(formData, false)} disabled={isSaving}>
              Save Draft
            </Button>
            <Button onClick={() => onSave(formData, true)} disabled={isSaving}>
              {formData.status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

// Helper functions
function countWords(content: string): number {
  return content
    .replace(/<[^>]*>/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

function countParagraphs(content: string): number {
  return content.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
}

function calculateReadingTime(content: string): number {
  const words = countWords(content)
  return Math.ceil(words / 200)
}
