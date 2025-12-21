"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Search, Download, UserX, RefreshCw, UserPlus, Upload } from "lucide-react"
import type { NewsletterSubscriber } from "@/lib/types"

export function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<NewsletterSubscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSubscriberDialog, setShowSubscriberDialog] = useState(false)
  const [subscriberEmail, setSubscriberEmail] = useState("")
  const [subscriberName, setSubscriberName] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadSubscribers()
  }, [])

  useEffect(() => {
    const filtered = subscribers.filter(
      (subscriber) =>
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredSubscribers(filtered)
  }, [subscribers, searchTerm])

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false })

      if (error) throw error
      setSubscribers(data || [])
    } catch (error) {
      console.error("Error loading subscribers:", error)
      toast({
        title: "Error",
        description: "Failed to load subscribers.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscriberEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      })
      return
    }

    setSubscribing(true)
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscriberEmail.trim(),
          name: subscriberName.trim() || undefined,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to subscribe")

      toast({
        title: "Success",
        description: "Successfully subscribed!",
      })

      setSubscriberEmail("")
      setSubscriberName("")
      setShowSubscriberDialog(false)
      loadSubscribers()
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe",
        variant: "destructive",
      })
    } finally {
      setSubscribing(false)
    }
  }

  const handleUnsubscribe = async (id: string) => {
    if (!confirm("Are you sure you want to unsubscribe this user?")) return

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Subscriber unsubscribed successfully!",
      })

      loadSubscribers()
    } catch (error) {
      console.error("Error unsubscribing:", error)
      toast({
        title: "Error",
        description: "Failed to unsubscribe user.",
        variant: "destructive",
      })
    }
  }

  const handleResubscribe = async (id: string) => {
    if (!confirm("Are you sure you want to resubscribe this user?")) return

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          status: "active",
          unsubscribed_at: null,
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Subscriber resubscribed successfully!",
      })

      loadSubscribers()
    } catch (error) {
      console.error("Error resubscribing:", error)
      toast({
        title: "Error",
        description: "Failed to resubscribe user.",
        variant: "destructive",
      })
    }
  }

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter((sub) => sub.status === "active")
    const csvContent = [
      ["Email", "Name", "Subscribed At"],
      ...activeSubscribers.map((sub) => [sub.email, sub.name || "", new Date(sub.subscribed_at).toLocaleDateString()]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "newsletter-subscribers.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Error",
        description: "Please upload a valid CSV file.",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      // Skip header row if it exists
      const dataLines = lines[0].toLowerCase().includes("email") ? lines.slice(1) : lines

      const emails: Array<{ email: string; name?: string }> = []

      for (const line of dataLines) {
        const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""))
        const email = values[0]
        const name = values[1] || undefined

        if (email && email.includes("@")) {
          emails.push({ email, name })
        }
      }

      if (emails.length === 0) {
        toast({
          title: "Error",
          description: "No valid emails found in the CSV file.",
          variant: "destructive",
        })
        return
      }

      // Import subscribers in batch
      let successCount = 0
      let errorCount = 0

      for (const { email, name } of emails) {
        try {
          const response = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
          })

          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch {
          errorCount++
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} subscriber(s). ${errorCount > 0 ? `${errorCount} failed.` : ""}`,
      })

      loadSubscribers()
    } catch (error) {
      console.error("Error importing CSV:", error)
      toast({
        title: "Error",
        description: "Failed to import CSV file.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const activeCount = subscribers.filter((sub) => sub.status === "active").length
  const unsubscribedCount = subscribers.filter((sub) => sub.status === "unsubscribed").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Subscribers</h1>
            <Button onClick={() => setShowSubscriberDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Subscriber
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="border border-border rounded-lg p-4">
            <div className="text-xs font-medium text-muted-foreground mb-1">Total Subscribers</div>
            <div className="text-2xl font-semibold">{subscribers.length}</div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="text-xs font-medium text-muted-foreground mb-1">Active</div>
            <div className="text-2xl font-semibold">{activeCount}</div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="text-xs font-medium text-muted-foreground mb-1">Unsubscribed</div>
            <div className="text-2xl font-semibold">{unsubscribedCount}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="sm:w-auto w-full bg-transparent"
            disabled={importing}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? "Importing..." : "Import CSV"}
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          <Button onClick={exportSubscribers} variant="outline" className="sm:w-auto w-full bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="space-y-3">
          {filteredSubscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{subscriber.email}</p>
                    <Badge variant={subscriber.status === "active" ? "default" : "secondary"} className="text-xs">
                      {subscriber.status}
                    </Badge>
                  </div>
                  {subscriber.name && <p className="text-sm text-muted-foreground">{subscriber.name}</p>}
                  <p className="text-xs text-muted-foreground">
                    Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    {subscriber.unsubscribed_at && (
                      <span className="block sm:inline sm:ml-2">
                        Unsubscribed: {new Date(subscriber.unsubscribed_at).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
                {subscriber.status === "active" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnsubscribe(subscriber.id)}
                    className="sm:w-auto w-full"
                  >
                    <UserX className="h-4 w-4" />
                    <span className="ml-2">Unsubscribe</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResubscribe(subscriber.id)}
                    className="sm:w-auto w-full"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="ml-2">Resubscribe</span>
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filteredSubscribers.length === 0 && (
            <div className="border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "No subscribers found matching your search." : "No subscribers yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showSubscriberDialog} onOpenChange={setShowSubscriberDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
            <DialogDescription>Enter the email and optional name for the new subscriber.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubscribe}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter subscriber email"
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name (Optional)
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter subscriber name"
                  value={subscriberName}
                  onChange={(e) => setSubscriberName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowSubscriberDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={subscribing}>
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
