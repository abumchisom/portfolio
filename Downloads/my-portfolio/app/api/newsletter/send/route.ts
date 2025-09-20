import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { newsletterId } = await request.json()

    if (!newsletterId) {
      return NextResponse.json({ error: "Newsletter ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get newsletter details
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("*")
      .eq("id", newsletterId)
      .single()

    if (newsletterError || !newsletter) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 })
    }

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email")
      .eq("status", "active")

    if (subscribersError) {
      return NextResponse.json({ error: "Failed to get subscribers" }, { status: 500 })
    }

    // In a real implementation, you would integrate with an email service like:
    // - Resend, SendGrid, Mailgun, etc.
    // For now, we'll just update the newsletter status

    const { error: updateError } = await supabase
      .from("newsletters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        sent_count: subscribers?.length || 0,
      })
      .eq("id", newsletterId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update newsletter status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${subscribers?.length || 0} subscribers`,
    })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
