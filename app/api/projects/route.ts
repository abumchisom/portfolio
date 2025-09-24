import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching projects:", error)
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error in projects GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, technologies, category, github_url, live_url, image_url, featured } =
      await request.json()

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          title,
          description,
          technologies: technologies || [],
          category,
          github_url,
          live_url,
          image_url,
          featured: featured || false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating project:", error)
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
    }

    return NextResponse.json({ success: true, project: data })
  } catch (error) {
    console.error("Error in projects POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
