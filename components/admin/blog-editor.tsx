"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  Trash2,
  Clock,
  Hash,
  FileText,
  ArrowLeft,
} from "lucide-react";
import type { Blog } from "@/lib/types";
import { AnyAaaaRecord } from "dns";
import { RichTextEditor } from "../ui/rich-text-editor";

export function BlogEditor() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Partial<Blog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error("Error loading blogs:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const calculateReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const countWords = (content: string) => {
    return content
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const countParagraphs = (content: string) => {
    return content.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  };

  const handleSave = async (
    blogData: Partial<Blog>,
    publish = false,
    unpublish = false
  ) => {
    setIsSaving(true);
    try {
      if (blogData.title && !blogData.slug) {
        blogData.slug = generateSlug(blogData.title);
      }

      if (unpublish) {
        blogData.status = "draft";
        delete blogData.published_at;
      } else if (publish) {
        blogData.status = "published";
        blogData.published_at = new Date().toISOString();
      } else {
        blogData.status = "draft";
      }

      if (selectedBlog?.id) {
        const updateData = {
          ...blogData,
          updated_at: new Date().toISOString(),
        };

        if (unpublish) {
          updateData.published_at = undefined;
        }

        const { error } = await supabase
          .from("blogs")
          .update(updateData)
          .eq("id", selectedBlog.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("blogs")
          .insert(blogData)
          .select()
          .single();

        if (error) throw error;
        setSelectedBlog(data);
      }

      toast({
        title: "Success",
        description: unpublish
          ? "Blog post unpublished and saved as draft successfully!"
          : `Blog post ${
              publish ? "published" : "saved as draft"
            } successfully!`,
      });

      loadBlogs();
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving blog:", error);
      toast({
        title: "Error",
        description: "Failed to save blog post.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted successfully!",
      });

      if (selectedBlog?.id === id) {
        setSelectedBlog(null);
        setShowEditor(false);
      }
      loadBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post.",
        variant: "destructive",
      });
    }
  };

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
    });
    setShowEditor(true);
  };

  const draftBlogs = blogs.filter((blog) => blog.status === "draft");
  const publishedBlogs = blogs.filter((blog) => blog.status === "published");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!showEditor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-medium">Blog Posts</h1>
              <Button onClick={createNewBlog}>New Post</Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Draft Posts Section */}
          <div className="mb-10">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Draft Posts ({draftBlogs.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {draftBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="border bg-card hover:bg-accent/50 transition-colors cursor-pointer p-6"
                  onClick={() => {
                    setSelectedBlog(blog);
                    setShowEditor(true);
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium line-clamp-2 flex-1">
                        {blog.title || "Untitled"}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {blog.excerpt || "No excerpt"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <span>
                        {new Date(blog.updated_at).toLocaleDateString()}
                      </span>
                      {blog.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {draftBlogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No draft posts
              </p>
            )}
          </div>

          {/* Published Posts Section */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Published Posts ({publishedBlogs.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publishedBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="border bg-card hover:bg-accent/50 transition-colors cursor-pointer p-6"
                  onClick={() => {
                    setSelectedBlog(blog);
                    setShowEditor(true);
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium line-clamp-2 flex-1">
                        {blog.title}
                      </h3>
                      <Badge>Published</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <span>
                        {blog.published_at
                          ? new Date(blog.published_at).toLocaleDateString()
                          : ""}
                      </span>
                      {blog.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {publishedBlogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No published posts
              </p>
            )}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">No blog posts yet</p>
              <Button onClick={createNewBlog}>Create Your First Post</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Editor Header */}
      <div className="border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={() => setShowEditor(false)}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {selectedBlog?.id && (
                <Button
                  onClick={() => handleDelete(selectedBlog.id!)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
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
                  generateSlug={generateSlug}
                  countWords={countWords}
                  countParagraphs={countParagraphs}
                  calculateReadingTime={calculateReadingTime}
                />
              </Dialog>
              <Button
                onClick={() => handleSave(selectedBlog || {})}
                variant="outline"
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Draft"}
              </Button>
              <Button
                onClick={() => handleSave(selectedBlog || {}, true)}
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Title Input */}
          <Input
            value={selectedBlog?.title || ""}
            onChange={(e) =>
              setSelectedBlog({ ...selectedBlog, title: e.target.value })
            }
            placeholder="Post title..."
            className="text-3xl font-semibold"
          />

          {/* Content Editor */}
          <RichTextEditor
            value={selectedBlog?.content || ""}
            onChange={(e: any) =>
              setSelectedBlog({
                ...selectedBlog,
                content: e.target.value,
              })
            }
            placeholder="Start writing your blog post..."
            className="h-full"
            showImageUpload={true}
            onImageUpload={async (file) => {
              // TODO:  image upload to storage
              return URL.createObjectURL(file);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BlogSettingsDialog({
  blog,
  onSave,
  onClose,
  isSaving,
  generateSlug,
  countWords,
  countParagraphs,
  calculateReadingTime,
}: {
  blog: Partial<Blog> | null;
  onSave: (blog: Partial<Blog>, publish?: boolean, unpublish?: boolean) => void;
  onClose: () => void;
  isSaving: boolean;
  generateSlug: (title: string) => string;
  countWords: (content: string) => number;
  countParagraphs: (content: string) => number;
  calculateReadingTime: (content: string) => number;
}) {
  const [formData, setFormData] = useState(blog || {});
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...blog }));
  }, [blog]);

  const computedSlug = useMemo(() => {
    if (formData.slug) return formData.slug;
    return generateSlug(formData.title || "");
  }, [formData.slug, formData.title, generateSlug]);

  const wordCount = formData.content ? countWords(formData.content) : 0;
  const paragraphCount = formData.content
    ? countParagraphs(formData.content)
    : 0;
  const readingTime = formData.content
    ? calculateReadingTime(formData.content)
    : 0;

  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          image_url: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveWithUpload = async (publish = false, unpublish = false) => {
    try {
      let updatedData = { ...formData, slug: computedSlug };

      if (featuredImageFile) {
        const fileName = `private/blog-${Date.now()}-${featuredImageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(fileName, featuredImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(fileName);

        updatedData = { ...updatedData, image_url: urlData.publicUrl };
      }

      onSave(updatedData, publish, unpublish);
    } catch (error) {
      console.error("Error uploading featured image:", error);
      toast({
        title: "Error",
        description: "Failed to upload featured image.",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
              value={computedSlug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="auto-generated-from-title"
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated from title. Edit to customize.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt || ""}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={3}
              placeholder="Brief description of your blog post..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="featured-image">Featured Image</Label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <Input
                  id="featured-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                />
              </div>
              {formData.image_url && (
                <img
                  src={(formData.image_url as string) || "/placeholder.svg"}
                  alt="Featured image preview"
                  className="w-24 h-24 object-cover border"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonical_url">Canonical URL</Label>
            <Input
              id="canonical_url"
              value={formData.canonical_url || ""}
              onChange={(e) =>
                setFormData({ ...formData, canonical_url: e.target.value })
              }
              placeholder="https://example.com/original-article"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value || undefined,
                  })
                }
                placeholder="Technology, Design, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean);
                  setFormData({ ...formData, tags });
                }}
                placeholder="react, nextjs, typescript"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked })
              }
            />
            <Label htmlFor="featured">Featured Post</Label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSaveWithUpload()}
            disabled={isSaving}
            variant="outline"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={() => handleSaveWithUpload(true)}
            disabled={isSaving}
          >
            {isSaving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
