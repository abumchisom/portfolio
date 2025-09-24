import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase/server"
import { FileText, FolderOpen, Mail, Users } from "lucide-react"

export async function AdminDashboard() {
  const supabase = await getSupabaseClient()

  // Get counts for dashboard stats
  const [{ count: projectsCount }, { count: blogsCount }, { count: subscribersCount }, { count: newslettersCount }] =
    await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("blogs").select("*", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
      supabase.from("newsletters").select("*", { count: "exact", head: true }),
    ])

  // Get recent activity
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
    {
      name: "Total Projects",
      value: projectsCount || 0,
      icon: FolderOpen,
      description: "Published and draft projects",
    },
    {
      name: "Blog Posts",
      value: blogsCount || 0,
      icon: FileText,
      description: "Published articles",
    },
    {
      name: "Newsletter Subscribers",
      value: subscribersCount || 0,
      icon: Users,
      description: "Active subscribers",
    },
    {
      name: "Newsletters Sent",
      value: newslettersCount || 0,
      icon: Mail,
      description: "Total newsletters",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your portfolio admin dashboard. Manage your content and track your progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Blog Posts</CardTitle>
            <CardDescription>Your latest blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBlogs?.map((blog) => (
                <div key={blog.title} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">{blog.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(blog.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{blog.status}</div>
                </div>
              ))}
              {!recentBlogs?.length && <p className="text-sm text-muted-foreground">No blog posts yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects?.map((project) => (
                <div key={project.title} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{project.status}</div>
                </div>
              ))}
              {!recentProjects?.length && <p className="text-sm text-muted-foreground">No projects yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
