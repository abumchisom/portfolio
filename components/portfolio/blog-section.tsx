"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type BlogSectionProps = {
  blogs?: any[]
}

export function BlogSection({ blogs = [] }: BlogSectionProps) {
  return (
    <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-background/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Latest Articles
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Insights and thoughts on technical writing, cybersecurity, and the intersection of clear communication and digital security.
          </p>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="group relative bg-card border border-border/60 rounded-xl overflow-hidden 
                           shadow-sm hover:shadow-xl hover:border-primary/50 
                           transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={post.image_url || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    {post.category && (
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <time>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Draft"}
                      </time>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold leading-tight text-card-foreground group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                      {post.title}
                    </Link>
                  </h3>

                  {post.excerpt && (
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/10">
                    <Link href={`/blog/${post.slug}`}>
                      Read more <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button size="lg" variant="outline" asChild className="border-border hover:bg-accent">
            <Link href="/blog">
              View All Articles <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}