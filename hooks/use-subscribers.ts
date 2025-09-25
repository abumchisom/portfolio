"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { NewsletterSubscriber } from "@/lib/types"

export function useSubscribers() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false })

      if (fetchError) throw fetchError

      setSubscribers(data || [])
    } catch (err) {
      console.error("Error fetching subscribers:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch subscribers")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const activeSubscribers = subscribers.filter((sub) => sub.status === "active")
  const unsubscribedCount = subscribers.filter((sub) => sub.status === "unsubscribed").length

  return {
    subscribers,
    activeSubscribers,
    unsubscribedCount,
    totalCount: subscribers.length,
    isLoading,
    error,
    refetch: fetchSubscribers,
  }
}
