import { getSupabaseClient } from "@/lib/supabase/server"
import { BlogPost } from "@/components/blog/blog-post"
import { notFound } from "next/navigation"
import { supabaseStatic } from "@/lib/supabase/static"


interface DraftBlogPageProps {
  params: {
    id: string
  }
}

export default async function DraftBlogPage({ params }: DraftBlogPageProps) {
  const supabase = await getSupabaseClient()

  const { data: post, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", params.id)
    .eq("status", "draft")
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
            📝 This is a draft preview. Only you can see this page.
          </p>
        </div>
        <BlogPost post={post} />
      </div>
    </div>
  )
}
