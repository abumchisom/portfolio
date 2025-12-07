"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Save,
  Clock,
  Hash,
  FileText,
  Settings,
  Trash2,
  EyeOff,
  MoreHorizontal,
} from "lucide-react";
import type { Blog } from "@/lib/types";

export function BlogEditor() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [draftBlogs, setDraftBlogs] = useState<Blog[]>([]);
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Partial<Blog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    // Separate blogs by status
    setDraftBlogs(blogs.filter((blog) => blog.status === "draft"));
    setPublishedBlogs(blogs.filter((blog) => blog.status === "published"));
  }, [blogs]);

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
      // Generate slug if not provided
      if (blogData.title && !blogData.slug) {
        blogData.slug = generateSlug(blogData.title);
      }

      // Set status
      if (unpublish) {
        blogData.status = "draft";
        delete blogData.published_at; // Clear published_at when unpublishing
      } else if (publish) {
        blogData.status = "published";
        blogData.published_at = new Date().toISOString();
      } else {
        blogData.status = "draft";
      }

      if (selectedBlog?.id) {
        // Update existing blog
        const updateData = {
          ...blogData,
          updated_at: new Date().toISOString(),
        };

        // Ensure we don't overwrite published_at unless publishing
        if (unpublish) {
          updateData.published_at = undefined;
        }

        const { error } = await supabase
          .from("blogs")
          .update(updateData)
          .eq("id", selectedBlog.id);

        if (error) throw error;
      } else {
        // Create new blog
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
  };

  if (isLoading) {
    return <div>Loading blog editor...</div>;
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
            <CardTitle className="text-sm">
              Draft Posts ({draftBlogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {draftBlogs.map((blog) => (
              <div
                key={blog.id}
                className={`group p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedBlog?.id === blog.id
                    ? "bg-muted border-primary"
                    : "bg-card"
                }`}
                onClick={() => setSelectedBlog(blog)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {blog.title || "Untitled"}
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(blog.id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {blog.excerpt || "No excerpt"}
                </p>
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
              <p className="text-sm text-muted-foreground text-center py-4">
                No draft posts
              </p>
            )}
          </CardContent>
        </Card>

        {/* Published Blogs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Published Posts ({publishedBlogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {publishedBlogs.map((blog) => (
              <div
                key={blog.id}
                className={`group p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedBlog?.id === blog.id
                    ? "bg-muted border-primary"
                    : "bg-card"
                }`}
                onClick={() => setSelectedBlog(blog)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {blog.title}
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave(blog, false, true);
                        }}
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(blog.id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {blog.published_at
                      ? new Date(blog.published_at).toLocaleDateString()
                      : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs">Published</Badge>
                    {blog.featured && (
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {publishedBlogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No published posts
              </p>
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
                  onChange={(e) =>
                    setSelectedBlog({ ...selectedBlog, title: e.target.value })
                  }
                  placeholder="Blog post title..."
                  className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(selectedBlog)}
                  disabled={isSaving}
                >
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
                    generateSlug={generateSlug}
                  />
                </Dialog>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="flex-1">
              <RichTextEditor
                value={selectedBlog.content || ""}
                onChange={(content) =>
                  setSelectedBlog({ ...selectedBlog, content })
                }
                placeholder="Start writing your blog post..."
                className="h-full"
                showImageUpload={true}
                onImageUpload={async (file) => {
                  // TODO: Implement image upload to storage
                  return URL.createObjectURL(file);
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No blog post selected
              </h3>
              <p className="text-muted-foreground mb-4">
                Select a blog post from the sidebar or create a new one to start
                editing.
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
  );
}

function BlogSettingsDialog({
  blog,
  onSave,
  onClose,
  isSaving,
  generateSlug,
}: {
  blog: Partial<Blog>;
  onSave: (blog: Partial<Blog>, publish?: boolean, unpublish?: boolean) => void;
  onClose: () => void;
  isSaving: boolean;
  generateSlug: (title: string) => string;
}) {
  const [formData, setFormData] = useState(blog);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  // Update formData when blog prop changes (e.g., title updated in main editor)
  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...blog }));
  }, [blog]);

  // Auto-set suggestions on dialog mount if empty
  useEffect(() => {
    if (blog.content) {
      setFormData((prev) => {
        const newData = { ...prev };
        const suggestedTags = getSuggestedTags(blog.content || "");
        const suggestedCategory = getSuggestedCategory(suggestedTags);
        if (!newData.category) {
          newData.category = suggestedCategory;
        }
        if (!newData.tags?.length) {
          newData.tags = suggestedTags;
        }
        return newData;
      });
    }
  }, []); // Only run once on mount

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData({ ...formData, tags });
  };

  // Auto-generate slug from title if not set
  const computedSlug = useMemo(() => {
    if (formData.slug) return formData.slug;
    return generateSlug(formData.title || "");
  }, [formData.slug, formData.title, generateSlug]);

  const suggestedTags = useMemo(
    () => getSuggestedTags(formData.content || ""),
    [formData.content]
  );
  const suggestedCategory = useMemo(
    () => getSuggestedCategory(suggestedTags),
    [suggestedTags]
  );

  const wordCount = formData.content ? countWords(formData.content) : 0;
  const paragraphCount = formData.content
    ? countParagraphs(formData.content)
    : 0;
  const readingTime = formData.content
    ? calculateReadingTime(formData.content)
    : 0;

  const finalData = useMemo(
    () => ({
      ...formData,
      slug: computedSlug,
      category: formData.category || suggestedCategory,
      tags: formData.tags?.length ? formData.tags : suggestedTags,
    }),
    [formData, computedSlug, suggestedCategory, suggestedTags]
  );

  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
      // Preview the image
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
      let updatedData = { ...finalData };
      // Handle featured image upload if a new file is selected
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
            <Label htmlFor="slug">URL Slug (Auto-generated from title, editable)</Label>
            <Input
              id="slug"
              value={computedSlug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="auto-generated-from-title"
            />
            <p className="text-xs text-muted-foreground">
              Edit to customize the URL slug. Clear to regenerate from title.
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
                  src={
                    typeof formData.image_url === "string"
                      ? formData.image_url
                      : formData.image_url
                  }
                  alt="Featured image preview"
                  className="w-24 h-24 object-cover border rounded"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Upload a featured image (JPG, PNG). It will be stored securely in
              Supabase Storage.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonical_url">Canonical URL</Label>
            <Input
              id="canonical_url"
              value={formData.canonical_url || ""}
              onChange={(e) =>
                setFormData({ ...formData, canonical_url: e.target.value })
              }
              placeholder="https://medium.com/@you/original-article"
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
                placeholder="Technical Writing, Cybersecurity, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div
                className="flex flex-wrap items-center gap-2 border rounded-md px-2 py-2 min-h-[42px] focus-within:ring-2 focus-within:ring-ring"
                onClick={() => document.getElementById("tagInput")?.focus()}
              >
                {formData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = formData.tags!.filter(
                          (_, i) => i !== index
                        );
                        setFormData({ ...formData, tags: newTags });
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  id="tagInput"
                  type="text"
                  className="flex-grow outline-none border-none bg-transparent text-sm"
                  placeholder="Type and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value && !formData.tags?.includes(value)) {
                        setFormData({
                          ...formData,
                          tags: [...(formData.tags || []), value],
                        });
                      }
                      e.currentTarget.value = "";
                    } else if (
                      e.key === "Backspace" &&
                      e.currentTarget.value === "" &&
                      formData.tags?.length
                    ) {
                      // Remove last tag when backspace pressed with empty input
                      const newTags = [...formData.tags];
                      newTags.pop();
                      setFormData({ ...formData, tags: newTags });
                    }
                  }}
                />
              </div>
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

          {/* Unpublish Switch for Published Posts */}
          {formData.status === "published" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="unpublish"
                checked={false} // Always false, as it's a toggle action
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleSaveWithUpload(false, true);
                  }
                }}
              />
              <Label htmlFor="unpublish">Unpublish (Make Draft)</Label>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSaveWithUpload(false)}
              disabled={isSaving}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleSaveWithUpload(true)}
              disabled={isSaving}
            >
              {formData.status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

// Helper functions
function countWords(content: string): number {
  return content
    .replace(/<[^>]*>/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

function countParagraphs(content: string): number {
  return content.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

function calculateReadingTime(content: string): number {
  const words = countWords(content);
  return Math.ceil(words / 200);
}

const stopWords = [
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "its",
  "our",
  "their",
];

function getSuggestedTags(content: string): string[] {
  const text = content.replace(/<[^>]*>/g, "").toLowerCase();
  const words = text
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word));
  const freq: Record<string, number> = words.reduce(
    (acc: Record<string, number>, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    },
    {}
  );
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function getSuggestedCategory(suggestedTags: string[]): string {
  return suggestedTags[0] || "";
}