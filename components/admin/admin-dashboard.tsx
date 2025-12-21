import { getSupabaseClient } from "@/lib/supabase/server"
import { FileText, FolderOpen, Mail, Users } from "lucide-react"

export async function AdminDashboard() {
  const supabase = await getSupabaseClient()

  const [{ count: projectsCount }, { count: blogsCount }, { count: subscribersCount }, { count: newslettersCount }] =
    await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("blogs").select("*", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
      supabase.from("newsletters").select("*", { count: "exact", head: true }),
    ])

  const { data: recentBlogs } = await supabase
    .from("blogs")
    .select("title, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentProjects } = await supabase
    .from("projects")
    .select("title, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    { name: "Total Projects", value: projectsCount || 0, icon: FolderOpen, desc: "Published and draft projects" },
    { name: "Blog Posts", value: blogsCount || 0, icon: FileText, desc: "Published articles" },
    { name: "Subscribers", value: subscribersCount || 0, icon: Users, desc: "Active subscribers" },
    { name: "Newsletters Sent", value: newslettersCount || 0, icon: Mail, desc: "Total sent" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome to your portfolio admin. Manage content and track progress.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="border border-border rounded-lg p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{stat.name}</p>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Blogs */}
          <div className="border border-border rounded-lg">
            <div className="p-5 border-b border-border">
              <h2 className="font-medium">Recent Blog Posts</h2>
              <p className="text-xs text-muted-foreground mt-1">Your latest articles</p>
            </div>
            <div className="p-5 space-y-4">
              {recentBlogs?.length ? (
                recentBlogs.map((blog) => (
                  <div key={blog.title} className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{blog.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize ml-4">{blog.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No blog posts yet.</p>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="border border-border rounded-lg">
            <div className="p-5 border-b border-border">
              <h2 className="font-medium">Recent Projects</h2>
              <p className="text-xs text-muted-foreground mt-1">Your latest work</p>
            </div>
            <div className="p-5 space-y-4">
              {recentProjects?.length ? (
                recentProjects.map((project) => (
                  <div key={project.title} className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize ml-4">{project.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No projects yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}