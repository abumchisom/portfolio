import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const { data: project, error } = await supabase.from("projects").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching project:", error)
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error in project GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, description, technologies, category, github_url, live_url, image_url, featured } =
      await request.json()

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("projects")
      .update({
        title,
        description,
        technologies,
        category,
        github_url,
        live_url,
        image_url,
        featured,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating project:", error)
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
    }

    return NextResponse.json({ success: true, project: data })
  } catch (error) {
    console.error("Error in project PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("projects").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting project:", error)
      return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in project DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
