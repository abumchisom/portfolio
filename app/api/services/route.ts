import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: services, error } = await (await supabase)
      .from("services")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching services:", error)
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
    }

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error in services GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { title, description, category, price_range, features } = body

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: service, error } = await (await supabase)
      .from("services")
      .insert({
        title,
        description,
        category,
        price_range,
        features: features || [],
        active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating service:", error)
      return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
    }

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error in services POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
