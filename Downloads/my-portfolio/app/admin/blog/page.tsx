import { BlogManager } from "@/components/admin/blog-manager"

export default function AdminBlogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
        <p className="text-muted-foreground">Manage your blog posts and articles.</p>
      </div>
      <BlogManager />
    </div>
  )
}
