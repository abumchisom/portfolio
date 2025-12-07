import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const [portfolioResult, aboutUsResult] = await Promise.all([
      supabase.from("portfolio_info").select("*").single(),
      supabase.from("about_us").select("*").single(),
    ])

    if (portfolioResult.error) {
      console.error("Error fetching portfolio info:", portfolioResult.error)
      return NextResponse.json({ error: "Failed to fetch portfolio info" }, { status: 500 })
    }

    return NextResponse.json({
      portfolio: portfolioResult.data,
      aboutUs: aboutUsResult.data || null,
    })
  } catch (error) {
    console.error("Error in portfolio GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      name,
      title,
      bio,
      email,
      phone,
      location,
      linkedin,
      github,
      twitter,
      website,
      profile_image,
    } = await request.json()

    const supabase = await createServerClient()

    // First check if portfolio info exists
    const { data: existing } = await supabase.from("portfolio_info").select("id").single()

    let data, error

    if (existing) {
      // Update existing record
      const result = await supabase
        .from("portfolio_info")
        .update({
          name,
          title,
          bio,
          email,
          phone,
          location,
          linkedin,
          github,
          twitter,
          website,
          profile_image,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      // Create new record
      const result = await supabase
        .from("portfolio_info")
        .insert([
          {
            name,
            title,
            bio,
            email,
            phone,
            location,
            linkedin,
            github,
            twitter,
            website,
            profile_image,
          },
        ])
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error("Error updating portfolio info:", error)
      return NextResponse.json({ error: "Failed to update portfolio info" }, { status: 500 })
    }

    return NextResponse.json({ success: true, portfolio: data })
  } catch (error) {
    console.error("Error in portfolio PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}