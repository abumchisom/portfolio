import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { title, subject, content } = await request.json()

    if (!title || !subject || !content) {
      return NextResponse.json({ error: "Title, subject, and content are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("newsletters")
      .insert([
        {
          title,
          subject,
          content,
          status: "draft",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating newsletter:", error)
      return NextResponse.json({ error: "Failed to create newsletter" }, { status: 500 })
    }

    return NextResponse.json({ success: true, newsletter: data })
  } catch (error) {
    console.error("Error in newsletter creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
