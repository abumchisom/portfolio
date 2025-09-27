import { BlogEditor } from "@/components/admin/blog-editor"

export default function AdminBlogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Blog Editor</h1>
        <p className="text-muted-foreground">Create and manage your blog posts with rich text editing.</p>
      </div>
      <BlogEditor />
    </div>
  )
}
