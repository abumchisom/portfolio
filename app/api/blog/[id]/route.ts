import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Shared type for dynamic route params
type BlogRouteContext = {
  params: Promise<{ id: string }>
}

// GET
export async function GET(request: NextRequest, { params }: BlogRouteContext) {
  try {
    const supabase = await createServerClient()
    const resolvedParams = await params // Resolve the params Promise

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", resolvedParams.id)
      .single()

    if (error) {
      console.error("Error fetching blog post:", error)
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error in blog post GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT
export async function PUT(request: NextRequest, { params }: BlogRouteContext) {
  try {
    const { title, content, excerpt, slug, category, tags, featured_image, published } =
      await request.json()
    const resolvedParams = await params // Resolve the params Promise

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        title,
        content,
        excerpt,
        slug,
        category,
        tags,
        featured_image,
        published,
      })
      .eq("id", resolvedParams.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating blog post:", error)
      return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error("Error in blog post PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE
export async function DELETE(request: NextRequest, { params }: BlogRouteContext) {
  try {
    const supabase = await createServerClient()
    const resolvedParams = await params // Resolve the params Promise

    const { error } = await supabase.from("blog_posts").delete().eq("id", resolvedParams.id)

    if (error) {
      console.error("Error deleting blog post:", error)
      return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in blog post DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}