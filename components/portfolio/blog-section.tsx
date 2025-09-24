import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const blogPosts = [
  {
    title: "The Art of Technical Writing: Making Complex Simple",
    excerpt:
      "Exploring the principles and practices that make technical documentation truly effective and user-friendly.",
    category: "Technical Writing",
    image: "/technical-writing-workspace-with-documents.jpg",
    publishedAt: "2024-01-15",
    slug: "art-of-technical-writing",
  },
  {
    title: "Cybersecurity Fundamentals: Building Your First Line of Defense",
    excerpt:
      "A comprehensive guide to establishing basic cybersecurity practices for individuals and small businesses.",
    category: "Cybersecurity",
    image: "/cybersecurity-shield-and-lock-icons.jpg",
    publishedAt: "2024-01-08",
    slug: "cybersecurity-fundamentals",
  },
  {
    title: "Documentation as Code: Version Control for Technical Writers",
    excerpt:
      "How technical writers can leverage version control systems to improve collaboration and maintain documentation quality.",
    category: "Technical Writing",
    image: "/git-version-control-interface.jpg",
    publishedAt: "2024-01-01",
    slug: "documentation-as-code",
  },
]

export function BlogSection() {
  return (
    <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Latest Articles</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Insights and thoughts on technical writing, cybersecurity, and the intersection of clear communication and
            digital security.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <Card key={index} className="bg-card border-border overflow-hidden group">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
                  <Link href={`/blog/${post.slug}`}>
                    Read more <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/blog">
              View All Articles <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
