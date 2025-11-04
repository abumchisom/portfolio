import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const supabase = createServerClient()

    const { data: service, error } = await (await supabase)
      .from("services")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching service:", error)
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error in service GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { title, description, category, price_range, features, active } = body

    const { data: service, error } = await (await supabase)
      .from("services")
      .update({
        title,
        description,
        category,
        price_range,
        features: features || [],
        active: active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating service:", error)
      return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error in service PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const supabase = createServerClient()

    const { error } = await (await supabase)
      .from("services")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting service:", error)
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error in service DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
