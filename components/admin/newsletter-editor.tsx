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

interface NewsletterEditorProps {
  newsletter?: Newsletter | null;
  onSave: (newsletter: Newsletter) => void;
  onCancel: () => void;
}

export function NewsletterEditor({
  newsletter,
  onSave,
  onCancel,
}: NewsletterEditorProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    if (newsletter) {
      setTitle(newsletter.title);
      setSubject(newsletter.subject);
      setContent(newsletter.content);
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

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Editor Panel */}
        <div className="space-y-4 ">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Newsletter Editor</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Edit" : "Preview"}
              </Button>
            </div>
          </div>

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

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="border-l pl-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <div className="text-sm text-muted-foreground">
              Email Template Preview
            </div>
          </div>

          <Card className="h-full overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="h-full overflow-y-auto">
                <div
                  className="prose prose-sm max-w-none p-6"
                  dangerouslySetInnerHTML={{
                    __html: generateEmailTemplate(
                      content || "Your newsletter content will appear here..."
                    )
                    .replace(/<!DOCTYPE[\s\S]*?<body.*?>/, "") // strip head/body start
      .replace(/<\/body>\s*<\/html>/, ""),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
