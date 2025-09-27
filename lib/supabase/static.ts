import { createClient } from "@supabase/supabase-js"

export const supabaseStatic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateStaticParams() {
  const { data: posts } = await supabaseStatic
    .from("blogs")
    .select("slug")
    .eq("status", "published")

  return (
    posts?.map((post) => ({
      slug: post.slug,
    })) || []
  )
}