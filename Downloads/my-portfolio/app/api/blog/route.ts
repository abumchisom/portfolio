import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching blog posts:", error)
      return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error in blog GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, excerpt, slug, category, tags, featured_image, published } = await request.json()

    if (!title || !content || !slug) {
      return NextResponse.json({ error: "Title, content, and slug are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("blog_posts")
      .insert([
        {
          title,
          content,
          excerpt,
          slug,
          category,
          tags: tags || [],
          featured_image,
          published: published || false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating blog post:", error)
      return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error("Error in blog POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
