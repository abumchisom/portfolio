import { BlogPost } from "@/components/blog/blog-post"
import { Navigation } from "@/components/portfolio/navigation"
import { getSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const supabase = await getSupabaseClient()

  const { data: post, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
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

export async function generateStaticParams() {
  const supabase = await getSupabaseClient()

  const { data: posts } = await supabase.from("blogs").select("slug").eq("status", "published")

  return (
    posts?.map((post) => ({
      slug: post.slug,
    })) || []
  )
}
