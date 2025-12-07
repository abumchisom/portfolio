"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Newsletter } from "@/lib/types";
import { Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NewsletterEditorProps {
  newsletter?: Newsletter | null;
  onSave: (newsletter: Newsletter) => void;
  onCancel: () => void;
  onPreview: (newsletter: Newsletter) => void;
}

export function NewsletterEditor({
  newsletter,
  onSave,
  onCancel,
  onPreview,
}: NewsletterEditorProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    if (newsletter) {
      setTitle(newsletter.title);
      setSubject(newsletter.subject);
      setContent(
        newsletter.content
          ? newsletter.content
              .replace(/<[^>]*>/g, "")
              .replace(/\n/g, "")
              .trim()
          : ""
      );
    } else {
      setTitle("");
      setSubject("");
      setContent("");
    }
  }, [newsletter]);

  // Generate HTML email template with content
  const generateEmailTemplate = (contentText: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            margin-bottom: 30px;
        }
        .content h2 {
            color: #1e293b;
            font-size: 22px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .content p {
            margin-bottom: 16px;
            color: #475569;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6b7280;
            font-size: 14px;
        }
        .unsubscribe {
            color: #6b7280;
            text-decoration: none;
        }
        .unsubscribe:hover {
            text-decoration: underline;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-container {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        
        <div class="content">
            ${contentText
              .split("\n")
              .map((paragraph) =>
                paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ""
              )
              .join("")}
        </div>
        
        <div class="footer">
            <p>Thank you for subscribing to our newsletter!</p>
            <p>
                <a href="{{unsubscribe_url}}" class="unsubscribe">
                    Unsubscribe from this newsletter
                </a>
            </p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleSave = async () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const htmlContent = generateEmailTemplate(content);

      const newsletterData = {
        title: title.trim(),
        subject: subject.trim(),
        content: htmlContent,
        status: "draft" as const,
      };

      let result;
      if (newsletter?.id) {
        // Update existing newsletter
        const { data, error } = await supabase
          .from("newsletters")
          .update(newsletterData)
          .eq("id", newsletter.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new newsletter
        const { data, error } = await supabase
          .from("newsletters")
          .insert([newsletterData])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      onSave(result);
      toast.success(
        newsletter?.id
          ? "Newsletter updated successfully"
          : "Newsletter created successfully"
      );
    } catch (error) {
      console.error("Error saving newsletter:", error);
      toast.error("Failed to save newsletter");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      toast.error("Please fill in all required fields before previewing");
      return;
    }
    const htmlContent = generateEmailTemplate(content);
    const tempNewsletter: Newsletter = {
      id: newsletter?.id ?? '',
      title,
      subject,
      content: htmlContent,
      status: "draft",
      recipient_count: newsletter?.recipient_count ?? 0,
      open_count: newsletter?.open_count ?? 0,
      click_count: newsletter?.click_count ?? 0,
      created_at: "",
      updated_at: ""
    };
    onPreview(tempNewsletter);
    setShowPreviewDialog(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {newsletter ? "Edit Newsletter" : "New Newsletter"}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Editor Panel */}
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Newsletter Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter newsletter title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Newsletter Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your newsletter content here..."
                rows={12}
                className="resize-none"
                required
              />
              <p className="text-sm text-muted-foreground">
                Write in plain text. Each paragraph will be formatted
                automatically in the email template.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePreview} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </div>

        {/* Live Input Preview (optional, but keeping simple as per request) */}
        <div className="border-l pl-6">
          <h3 className="text-lg font-semibold mb-4">Content Preview</h3>
          <div className="bg-muted p-4 rounded-lg h-64 overflow-y-auto">
            <div className="prose prose-sm">
              {content
                .split("\n")
                .filter((p) => p.trim())
                .map((paragraph, index) => (
                  <p key={index} className="mb-2">{paragraph}</p>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      {/* <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Newsletter Design Preview</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-auto p-4">
            <div
              dangerouslySetInnerHTML={{ __html: generateEmailTemplate(content) }}
            />
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}