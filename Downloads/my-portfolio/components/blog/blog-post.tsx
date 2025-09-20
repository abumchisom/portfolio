import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Blog } from "@/lib/types"

interface BlogPostProps {
  post: Blog
}

export function BlogPost({ post }: BlogPostProps) {
  const readingTime = Math.ceil(post.content.split(" ").length / 200) // Approximate reading time

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {post.featured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
            {post.category && <Badge variant="secondary">{post.category}</Badge>}
          </div>

          <h1 className="text-4xl font-bold text-foreground text-balance">{post.title}</h1>

          {post.excerpt && <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {post.published_at && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {readingTime} min read
            </div>
          </div>
        </div>
      </div>

      {post.image_url && (
        <div className="relative aspect-video mb-12 overflow-hidden rounded-lg">
          <Image src={post.image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="prose prose-invert max-w-none">
        <div
          className="text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
        />
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-border text-center">
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Posts
          </Link>
        </Button>
      </div>
    </article>
  )
}
