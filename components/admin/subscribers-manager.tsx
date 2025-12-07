"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Search, Download, UserX, RefreshCw, UserPlus } from "lucide-react"
import type { NewsletterSubscriber } from "@/lib/types"

export function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<NewsletterSubscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // New states for subscriber dialog
  const [showSubscriberDialog, setShowSubscriberDialog] = useState(false)
  const [subscriberEmail, setSubscriberEmail] = useState("")
  const [subscriberName, setSubscriberName] = useState("")
  const [subscribing, setSubscribing] = useState(false)

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

  // New handler for adding subscriber
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

  const activeCount = subscribers.filter((sub) => sub.status === "active").length
  const unsubscribedCount = subscribers.filter((sub) => sub.status === "unsubscribed").length

  if (isLoading) {
    return <div>Loading subscribers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unsubscribedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center gap-4">
        <Button onClick={() => setShowSubscriberDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Subscriber
        </Button>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportSubscribers} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
          <CardDescription>Manage your newsletter subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubscribers.map((subscriber) => (
              <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{subscriber.email}</p>
                    <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                      {subscriber.status}
                    </Badge>
                  </div>
                  {subscriber.name && <p className="text-sm text-muted-foreground">{subscriber.name}</p>}
                  <p className="text-xs text-muted-foreground">
                    Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    {subscriber.unsubscribed_at && (
                      <span className="ml-2">
                        • Unsubscribed: {new Date(subscriber.unsubscribed_at).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
                {subscriber.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => handleUnsubscribe(subscriber.id)}>
                    <UserX className="h-4 w-4 mr-2" />
                    Unsubscribe
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleResubscribe(subscriber.id)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resubscribe
                  </Button>
                )}
              </div>
            ))}

            {filteredSubscribers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "No subscribers found matching your search." : "No subscribers yet."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Subscriber Dialog */}
      <Dialog open={showSubscriberDialog} onOpenChange={setShowSubscriberDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
            <DialogDescription>Enter the email and optional name for the new subscriber.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubscribe}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter subscriber email"
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name (Optional)</Label>
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