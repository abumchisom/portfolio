import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await getSupabaseClient()

    // Check if subscriber already exists
    const { data: existingSubscriber } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", email)
      .single()

    if (existingSubscriber) {
      if (existingSubscriber.status === "active") {
        return NextResponse.json({ error: "Email is already subscribed" }, { status: 400 })
      } else {
        // Reactivate subscription
        const { error } = await supabase
          .from("newsletter_subscribers")
          .update({
            status: "active",
            name: name || null,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
          })
          .eq("id", existingSubscriber.id)

        if (error) {
          console.error("Error reactivating subscription:", error)
          return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      }
    }

    // Create new subscription
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      name: name || null,
      status: "active",
    })

    if (error) {
      console.error("Error creating subscription:", error)
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in newsletter subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
