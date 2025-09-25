"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've been subscribed to the newsletter.",
        })
        setEmail("")
        setName("")
      } else {
        throw new Error("Failed to subscribe")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="border border-border/60 rounded-xl bg-background/50 p-10 text-center transition">
          <h2 className="text-2xl font-semibold mb-2">Stay Updated</h2>
          <p className="text-muted-foreground mb-8">
            Get the latest insights on technical writing, cybersecurity trends, and best practices delivered weekly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              No spam, unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
