"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import type { Newsletter, Subscriber } from "@/lib/types"
import { Mail, Users, Send, Eye, Plus, Calendar } from "lucide-react"
import { toast } from "sonner"

export function NewsletterManager() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [newslettersRes, subscribersRes] = await Promise.all([
        supabase.from("newsletters").select("*").order("created_at", { ascending: false }),
        supabase.from("subscribers").select("*").order("created_at", { ascending: false }),
      ])

      if (newslettersRes.data) setNewsletters(newslettersRes.data)
      if (subscribersRes.data) setSubscribers(subscribersRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const createNewsletter = async (formData: FormData) => {
    setIsCreating(true)
    try {
      const newsletter = {
        title: formData.get("title") as string,
        subject: formData.get("subject") as string,
        content: formData.get("content") as string,
        status: "draft" as const,
      }

      const { data, error } = await supabase.from("newsletters").insert([newsletter]).select().single()

      if (error) throw error

      setNewsletters((prev) => [data, ...prev])
      toast.success("Newsletter created successfully")
    } catch (error) {
      console.error("Error creating newsletter:", error)
      toast.error("Failed to create newsletter")
    } finally {
      setIsCreating(false)
    }
  }

  const sendNewsletter = async (newsletterId: string) => {
    try {
      // Update newsletter status to sent
      const { error } = await supabase
        .from("newsletters")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", newsletterId)

      if (error) throw error

      // Update local state
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
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
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
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

      <Tabs defaultValue="newsletters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="newsletters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Newsletters</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Newsletter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Newsletter</DialogTitle>
                  <DialogDescription>Create a new newsletter to send to your subscribers</DialogDescription>
                </DialogHeader>
                <form action={createNewsletter} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="Newsletter title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input id="subject" name="subject" placeholder="Email subject line" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Newsletter content (HTML supported)"
                      rows={10}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Newsletter"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
                      <Badge variant={newsletter.status === "sent" ? "default" : "secondary"}>
                        {newsletter.status}
                      </Badge>
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
                      <Button size="sm" onClick={() => sendNewsletter(newsletter.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send to {subscribers.length} subscribers
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subscribers ({subscribers.length})</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscriber List</CardTitle>
              <CardDescription>Manage your newsletter subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscribers.map((subscriber) => (
                  <div key={subscriber.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{subscriber.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Subscribed: {new Date(subscriber.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                      {subscriber.status}
                    </Badge>
                  </div>
                ))}

                {subscribers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No subscribers yet. Share your newsletter signup form to get started!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
