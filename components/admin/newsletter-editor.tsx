"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@/lib/supabase/client"
import type { Newsletter } from "@/lib/types"
import { Save, Eye, X } from "lucide-react"
import { toast } from "sonner"

interface NewsletterEditorProps {
  newsletter?: Newsletter | null
  onSave: (newsletter: Newsletter) => void
  onCancel: () => void
  onPreview: (newsletter: Newsletter) => void
}

export function NewsletterEditor({ newsletter, onSave, onCancel, onPreview }: NewsletterEditorProps) {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    if (newsletter) {
      setTitle(newsletter.title)
      setSubject(newsletter.subject)
      setContent(
        newsletter.content
          ? newsletter.content
              .replace(/<[^>]*>/g, "")
              .replace(/\n/g, "")
              .trim()
          : "",
      )
    } else {
      setTitle("")
      setSubject("")
      setContent("")
    }
  }, [newsletter])

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
              .map((paragraph) => (paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ""))
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
</html>`
  }

  const handleSave = async () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    try {
      const htmlContent = generateEmailTemplate(content)

      const newsletterData = {
        title: title.trim(),
        subject: subject.trim(),
        content: htmlContent,
        status: "draft" as const,
      }

      let result
      if (newsletter?.id) {
        // Update existing newsletter
        const { data, error } = await supabase
          .from("newsletters")
          .update(newsletterData)
          .eq("id", newsletter.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new newsletter
        const { data, error } = await supabase.from("newsletters").insert([newsletterData]).select().single()

        if (error) throw error
        result = data
      }

      onSave(result)
      toast.success(newsletter?.id ? "Newsletter updated successfully" : "Newsletter created successfully")
    } catch (error) {
      console.error("Error saving newsletter:", error)
      toast.error("Failed to save newsletter")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      toast.error("Please fill in all required fields before previewing")
      return
    }
    const htmlContent = generateEmailTemplate(content)
    const tempNewsletter: Newsletter = {
      id: newsletter?.id ?? "",
      title,
      subject,
      content: htmlContent,
      status: "draft",
      recipient_count: newsletter?.recipient_count ?? 0,
      open_count: newsletter?.open_count ?? 0,
      click_count: newsletter?.click_count ?? 0,
      created_at: "",
      updated_at: "",
    }
    onPreview(tempNewsletter)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">{newsletter ? "Edit Newsletter" : "New Newsletter"}</h2>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium">
                Newsletter Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter newsletter title"
                className="border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-sm font-medium">
                Email Subject Line
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-sm font-medium">
                Newsletter Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your newsletter content here..."
                rows={16}
                className="resize-none border-border"
                required
              />
              <p className="text-xs text-muted-foreground">
                Write in plain text. Each paragraph will be formatted automatically in the email template.
              </p>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Content Preview</h3>
            <div className="border border-border rounded-lg p-6 min-h-[500px] overflow-y-auto bg-muted/30">
              {content ? (
                <div className="space-y-3">
                  {content
                    .split("\n")
                    .filter((p) => p.trim())
                    .map((paragraph, index) => (
                      <p key={index} className="text-sm leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Your content preview will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
