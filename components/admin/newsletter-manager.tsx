"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Newsletter } from "@/lib/types";
import { Plus, Edit, Send, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useSubscribers } from "@/hooks/use-subscribers";
import { NewsletterEditor } from "./newsletter-editor";

export function NewsletterManager() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "editor">("list");
  const [showPreview, setShowPreview] = useState(false);
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);

  // New states for subscriber dialog
  const [showSubscriberDialog, setShowSubscriberDialog] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriberName, setSubscriberName] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const { activeSubscribers, totalCount: subscriberCount, isLoading: subscribersLoading, refetch: refetchSubscribers } = useSubscribers();

  const supabase = createBrowserClient();

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      toast.error("Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setCurrentView("editor");
  };

  const handleNew = () => {
    setSelectedNewsletter(null);
    setCurrentView("editor");
  };

  const handleSave = (newsletter: Newsletter) => {
    setNewsletters((prev) =>
      prev.map((n) => (n.id === newsletter.id ? newsletter : n))
    );
    if (!newsletter.id) {
      setNewsletters((prev) => [newsletter, ...prev]);
    }
    setSelectedNewsletter(null);
    setCurrentView("list");
  };

  const handleCancel = () => {
    setSelectedNewsletter(null);
    setCurrentView("list");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this newsletter?")) return;

    try {
      const { error } = await supabase.from("newsletters").delete().eq("id", id);
      if (error) throw error;

      setNewsletters((prev) => prev.filter((n) => n.id !== id));
      toast.success("Newsletter deleted successfully");
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      toast.error("Failed to delete newsletter");
    }
  };

  const handleResend = async (newsletterId: string) => {
    if (!confirm("Are you sure you want to resend this newsletter?")) return;

    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      });

      const result = await response.json();
      console.log(result, "Resend result");
      if (!response.ok) throw new Error(result.error || "Failed to resend");

      toast.success(result.message);
      fetchNewsletters(); 
    } catch (error) {
      console.error("Error resending newsletter:", error);
      toast.error("Failed to resend newsletter");
    }
  };

  const handlePreview = (newsletter: Newsletter) => {
    setPreviewNewsletter(newsletter);
    setShowPreview(true);
  };

  // New handler for subscribing
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    setSubscribing(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscriberEmail.trim(),
          name: subscriberName.trim() || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to subscribe");

      toast.success("Successfully subscribed!");
      setSubscriberEmail("");
      setSubscriberName("");
      setShowSubscriberDialog(false);
      // Refetch subscribers to update count
      if (refetchSubscribers) {
        refetchSubscribers();
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(error instanceof Error ? error.message : "Failed to subscribe");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading || subscribersLoading) {
    return <div>Loading...</div>;
  }

  const draftCount = newsletters.filter((n) => n.status === "draft").length;
  const sentCount = newsletters.filter((n) => n.status === "sent").length;

  return (
    <div className="space-y-6">
      {/* Stats - Added Subscriber Count Card */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsletters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{draftCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{subscriberCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* List View */}
      {currentView === "list" && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Newsletters</h1>
            <div className="flex gap-2">
              <Button onClick={() => setShowSubscriberDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                New Newsletter
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {newsletters.map((newsletter) => (
              <Card key={newsletter.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{newsletter.title}</h3>
                      <p className="text-sm text-muted-foreground">{newsletter.subject}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={newsletter.status === "draft" ? "secondary" : "default"}>
                          {newsletter.status}
                        </Badge>
                        {newsletter.sent_at && (
                          <span className="text-xs text-muted-foreground">
                            Sent: {new Date(newsletter.sent_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(newsletter)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(newsletter)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {newsletter.status === "sent" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResend(newsletter.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Resend
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(newsletter.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {newsletters.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No newsletters yet.</p>
                  <Button onClick={handleNew} className="mt-4">
                    Create your first newsletter
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
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
              <div
                dangerouslySetInnerHTML={{ __html: previewNewsletter.content }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Subscriber Dialog */}
      <Dialog open={showSubscriberDialog} onOpenChange={setShowSubscriberDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
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
  );
}