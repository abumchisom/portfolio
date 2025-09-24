import { BlogList } from "@/components/blog/blog-list"
import { Navigation } from "@/components/portfolio/navigation"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Blog</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Insights and thoughts on technical writing, cybersecurity, and the intersection of clear communication and
              digital security.
            </p>
          </div>
          <BlogList />
        </div>
      </main>
    </div>
  )
}
