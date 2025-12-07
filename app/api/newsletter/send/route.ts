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

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, message: "No active subscribers" })
    }

    // Create Nodemailer transporter with increased timeouts
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Increase connection timeout to 30s (default is ~10s) and socket timeout to 5min
      connectionTimeout: 30000,
      socketTimeout: 300000,
      greetingTimeout: 30000,
      // Optional: Pool connections for better performance (reuse for batches)
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    })

    // Optional: Verify transporter (uncomment for testing, but it adds delay)
    // await transporter.verify()

    // Track progress in DB (for resuming if the function times out)
    let successfulSends = 0
    let failedSends = 0

    // Send emails in batches sequentially (e.g., 10 at a time) to respect rate limits
    const BATCH_SIZE = 10
    const DELAY_BETWEEN_BATCHES_MS = 2000 

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)
      const batchPromises = batch.map(async (subscriber) => {
        const maxRetries = 3
        let attempt = 0
        let lastError: Error | null = null

        while (attempt < maxRetries) {
          try {
            const mailOptions = {
              from: `"${newsletter.from_name || 'Newsletter'}" <${process.env.SMTP_USER}>`,
              to: subscriber.email,
              subject: newsletter.subject,
              html: newsletter.content, 
            }

            await transporter.sendMail(mailOptions)
            successfulSends++
            console.log(`Email sent to ${subscriber.email}`)
            return { success: true }
          } catch (emailError) {
            attempt++
            lastError = emailError as Error
            console.error(`Attempt ${attempt} failed for ${subscriber.email}:`, emailError)

            if (attempt < maxRetries) {
              // Exponential backoff: wait 1s, 2s, 4s
              const backoffDelay = Math.pow(2, attempt - 1) * 1000
              await new Promise(resolve => setTimeout(resolve, backoffDelay))
            }
          }
        }

        if (lastError) {
          failedSends++
          console.error(`All retries failed for ${subscriber.email}:`, lastError)
        }
        return { success: false }
      })

      // Process batch concurrently but limited
      await Promise.all(batchPromises)

      // Pause between batches
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS))
      }

      // Optional: Update DB every batch to track partial progress (prevents data loss on timeout)
      await supabase
        .from("newsletters")
        .update({
          status: "sending",
          sent_at: new Date().toISOString(),
          recipient_count: successfulSends,
        })
        .eq("id", newsletterId)
    }

    // Final update after all batches
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({
        status: "sent",
        recipient_count: successfulSends,
      })
      .eq("id", newsletterId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update newsletter status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${successfulSends} subscribers (${failedSends} failed)`,
    })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}