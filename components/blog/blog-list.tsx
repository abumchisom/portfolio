import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/server"

export async function BlogList() {
  const supabase = await getSupabaseClient()

  const { data: posts, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (error || !posts?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No blog posts found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-colors"
        >
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/3 relative">
              <div className="aspect-[4/3] md:h-full overflow-hidden">
                <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Content */}
            <div className="md:w-2/3 flex flex-col justify-between p-5">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2">
                    {post.featured && (
                      <Badge className="bg-primary text-primary-foreground text-xs">Featured</Badge>
                    )}
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

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-lg md:text-xl font-semibold hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                </Link>

                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex flex-wrap gap-1">
                  {post.tags?.slice(0, 3).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button variant="link" size="sm" asChild className="text-sm text-primary">
                  <Link href={`/blog/${post.slug}`}>
                    Read more <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
