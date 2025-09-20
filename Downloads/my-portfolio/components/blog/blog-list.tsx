import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/server"

export async function BlogList() {
  const supabase = await getSupabaseClient()

  const { data: posts, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (error || !posts) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No blog posts found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8">
      {posts.map((post) => (
        <Card key={post.id} className="bg-card border-border overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="relative aspect-video md:aspect-square overflow-hidden">
                <Image src={post.image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
              </div>
            </div>
            <div className="md:w-2/3">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2">
                    {post.featured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
                    {post.category && (
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : "Draft"}
                  </div>
                </div>
                <CardTitle className="text-xl leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-muted-foreground">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      Read more <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
