"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import type { Newsletter } from "@/lib/types"
import { Mail, Users, Send, Eye, Plus, Calendar, Edit, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useSubscribers } from "@/hooks/use-subscribers"
import { NewsletterEditor } from "./newsletter-editor"

export function NewsletterManager() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [currentView, setCurrentView] = useState<"list" | "editor">("list")
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null)

  const { activeSubscribers, totalCount: subscriberCount, isLoading: subscribersLoading } = useSubscribers()

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

  const sendNewsletter = async (newsletterId: string) => {
    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      })

      if (!response.ok) throw new Error("Failed to send newsletter")

      setNewsletters((prev) =>
        prev.map((n) =>
          n.id === newsletterId ? { ...n, status: "sent" as const, sent_at: new Date().toISOString() } : n,
        ),
      )

      toast.success("Newsletter sent successfully")
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast.error("Failed to send newsletter")
    }
  }

  const handleNewsletterSaved = (newsletter: Newsletter) => {
    setNewsletters((prev) => {
      const existing = prev.find((n) => n.id === newsletter.id)
      if (existing) {
        return prev.map((n) => (n.id === newsletter.id ? newsletter : n))
      } else {
        return [newsletter, ...prev]
      }
    })
    setCurrentView("list")
    setEditingNewsletter(null)
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setEditingNewsletter(null)
  }

  const handleOpenEditor = (newsletter?: Newsletter) => {
    setEditingNewsletter(newsletter || null)
    setCurrentView("editor")
  }

  if (loading || subscribersLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (currentView === "editor") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Newsletters
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{editingNewsletter ? "Edit Newsletter" : "Create Newsletter"}</h2>
            <p className="text-sm text-muted-foreground">Design your newsletter with live preview</p>
          </div>
        </div>

        <NewsletterEditor newsletter={editingNewsletter} onSave={handleNewsletterSaved} onCancel={handleBackToList} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsletters.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent This Month</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {newsletters.filter((n) => n.sent_at && new Date(n.sent_at).getMonth() === new Date().getMonth()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Newsletter Management</h2>
        <Button onClick={() => handleOpenEditor()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Newsletter
        </Button>
      </div>

      <div className="grid gap-4">
        {newsletters.map((newsletter) => (
          <Card key={newsletter.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{newsletter.title}</CardTitle>
                  <CardDescription>{newsletter.subject}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={newsletter.status === "sent" ? "default" : "secondary"}>{newsletter.status}</Badge>
                  {newsletter.sent_at && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(newsletter.sent_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedNewsletter(newsletter)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{newsletter.title}</DialogTitle>
                      <DialogDescription>Subject: {newsletter.subject}</DialogDescription>
                    </DialogHeader>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: newsletter.content }} />
                    </div>
                  </DialogContent>
                </Dialog>

                {newsletter.status === "draft" && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditor(newsletter)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => sendNewsletter(newsletter.id)}>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {activeSubscribers.length} subscribers
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {newsletters.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No newsletters yet. Create your first newsletter to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
