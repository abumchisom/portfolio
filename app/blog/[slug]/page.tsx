import { BlogPost } from "@/components/blog/blog-post"
import { Navigation } from "@/components/portfolio/navigation"
import { getSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface BlogPostPageProps {
  params: { slug: string }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const supabase = await getSupabaseClient()

  const { data: post, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-20">
        <BlogPost post={post} />
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const supabase = await getSupabaseClient()

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", params.slug)
    .single()

  if (error || !blog) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://abumchisom.com"

  return {
    title: blog.title,
    description: blog.excerpt || "",
    alternates: {
      canonical: blog.canonical_url || `${siteUrl}/blog/${params.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: blog.canonical_url || `${siteUrl}/blog/${params.slug}`,
      images: blog.image_url ? [blog.image_url] : [],
      type: "article",
    },
  }
}
