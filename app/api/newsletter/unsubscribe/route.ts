import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Update subscriber status to unsubscribed
    const { error } = await supabase
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email)

    if (error) {
      console.error("Error unsubscribing:", error)
      return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in newsletter unsubscribe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
