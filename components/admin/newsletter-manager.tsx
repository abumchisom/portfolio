"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"
import type { Newsletter } from "@/lib/types"
import { Plus, Edit, Send, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { useSubscribers } from "@/hooks/use-subscribers"
import { NewsletterEditor } from "./newsletter-editor"

export function NewsletterManager() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [currentView, setCurrentView] = useState<"list" | "editor">("list")
  const [showPreview, setShowPreview] = useState(false)
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null)
  const [showSubscriberDialog, setShowSubscriberDialog] = useState(false)
  const [subscriberEmail, setSubscriberEmail] = useState("")
  const [subscriberName, setSubscriberName] = useState("")
  const [subscribing, setSubscribing] = useState(false)

  const {
    activeSubscribers,
    totalCount: subscriberCount,
    isLoading: subscribersLoading,
    refetch: refetchSubscribers,
  } = useSubscribers()

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase.from("newsletters").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setNewsletters(data || [])
    } catch (error) {
      console.error("Error fetching newsletters:", error)
      toast.error("Failed to load newsletters")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter)
    setCurrentView("editor")
  }

  const handleNew = () => {
    setSelectedNewsletter(null)
    setCurrentView("editor")
  }

  const handleSave = (newsletter: Newsletter) => {
    setNewsletters((prev) => prev.map((n) => (n.id === newsletter.id ? newsletter : n)))
    if (!newsletter.id) {
      setNewsletters((prev) => [newsletter, ...prev])
    }
    setSelectedNewsletter(null)
    setCurrentView("list")
  }

  const handleCancel = () => {
    setSelectedNewsletter(null)
    setCurrentView("list")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this newsletter?")) return

    try {
      const { error } = await supabase.from("newsletters").delete().eq("id", id)
      if (error) throw error

      setNewsletters((prev) => prev.filter((n) => n.id !== id))
      toast.success("Newsletter deleted successfully")
    } catch (error) {
      console.error("Error deleting newsletter:", error)
      toast.error("Failed to delete newsletter")
    }
  }

  const handleResend = async (newsletterId: string) => {
    if (!confirm("Are you sure you want to resend this newsletter?")) return

    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      })

      const result = await response.json()
      console.log(result, "Resend result")
      if (!response.ok) throw new Error(result.error || "Failed to resend")

      toast.success(result.message)
      fetchNewsletters()
    } catch (error) {
      console.error("Error resending newsletter:", error)
      toast.error("Failed to resend newsletter")
    }
  }

  const handlePreview = (newsletter: Newsletter) => {
    setPreviewNewsletter(newsletter)
    setShowPreview(true)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscriberEmail.trim()) {
      toast.error("Email is required")
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

      toast.success("Successfully subscribed!")
      setSubscriberEmail("")
      setSubscriberName("")
      setShowSubscriberDialog(false)
      if (refetchSubscribers) {
        refetchSubscribers()
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast.error(error instanceof Error ? error.message : "Failed to subscribe")
    } finally {
      setSubscribing(false)
    }
  }

  if (loading || subscribersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const draftCount = newsletters.filter((n) => n.status === "draft").length
  const sentCount = newsletters.filter((n) => n.status === "sent").length

  return (
    <div>
      {/* List View */}
      {currentView === "list" && (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b border-border">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <h1 className="text-2xl font-semibold">Newsletters</h1>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowSubscriberDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Subscriber
                  </Button>
                  <Button onClick={handleNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Newsletter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">Total Newsletters</div>
                <div className="text-2xl font-semibold">{newsletters.length}</div>
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">Drafts</div>
                <div className="text-2xl font-semibold">{draftCount}</div>
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">Sent</div>
                <div className="text-2xl font-semibold">{sentCount}</div>
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">Active Subscribers</div>
                <div className="text-2xl font-semibold">{subscriberCount}</div>
              </div>
            </div>

            {/* Newsletter List */}
            <div className="space-y-3">
              {newsletters.map((newsletter) => (
                <div
                  key={newsletter.id}
                  className="border border-border rounded-lg p-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-base font-medium">{newsletter.title}</h3>
                      <p className="text-sm text-muted-foreground">{newsletter.subject}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant={newsletter.status === "draft" ? "secondary" : "default"} className="text-xs">
                          {newsletter.status}
                        </Badge>
                        {newsletter.sent_at && (
                          <span className="text-xs text-muted-foreground">
                            Sent: {new Date(newsletter.sent_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreview(newsletter)}>
                        <span className="md:inline hidden mr-2">Preview</span>
                        <span className="md:hidden">Preview</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(newsletter)}>
                        <Edit className="h-4 w-4" />
                        <span className="ml-2 md:inline hidden">Edit</span>
                      </Button>
                      {newsletter.status === "sent" && (
                        <Button variant="outline" size="sm" onClick={() => handleResend(newsletter.id)}>
                          <Send className="h-4 w-4" />
                          <span className="ml-2 md:inline hidden">Resend</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(newsletter.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {newsletters.length === 0 && (
                <div className="border border-border rounded-lg p-12 text-center">
                  <p className="text-sm text-muted-foreground mb-4">No newsletters yet.</p>
                  <Button onClick={handleNew}>Create your first newsletter</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor View */}
      {currentView === "editor" && (
        <NewsletterEditor
          newsletter={selectedNewsletter}
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={handlePreview}
        />
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Newsletter Preview</DialogTitle>
          </DialogHeader>
          {previewNewsletter && (
            <div className="h-full overflow-auto p-4">
              <div dangerouslySetInnerHTML={{ __html: previewNewsletter.content }} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscriber Dialog */}
      <Dialog open={showSubscriberDialog} onOpenChange={setShowSubscriberDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
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
