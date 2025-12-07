import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import nodemailer from 'nodemailer'

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

    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("status", "active")

    if (subscribersError) {
      return NextResponse.json({ error: "Failed to get subscribers" }, { status: 500 })
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Verify transporter configuration (optional, for testing)
    // await transporter.verify()

    let successfulSends = 0
    const sendPromises = subscribers.map(async (subscriber) => {
      try {
        const mailOptions = {
          from: `"${newsletter.from_name || 'Newsletter'}" <${process.env.SMTP_USER}>`,
          to: subscriber.email,
          subject: newsletter.subject,
          html: newsletter.content, 
        }

        await transporter.sendMail(mailOptions)
        successfulSends++
      } catch (emailError) {
        console.error(`Failed to send email to ${subscriber.email}:`, emailError)
        // Continue with other emails
      }
    })

    await Promise.all(sendPromises)

    // Update newsletter status
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: successfulSends,
      })
      .eq("id", newsletterId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update newsletter status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${successfulSends} subscribers`,
    })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}