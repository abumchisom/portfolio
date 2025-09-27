"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showImageUpload?: boolean
  onImageUpload?: (file: File) => Promise<string>
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  showImageUpload = true,
  onImageUpload,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value)
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
    },
    [onChange],
  )

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])
  

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImageUpload) return

    setIsUploading(true)
    try {
      const imageUrl = await onImageUpload(file)
      execCommand("insertImage", imageUrl)
    } catch (error) {
      console.error("Image upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const formatBlock = (tag: string) => {
    execCommand("formatBlock", tag)
  }

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50">
        <Button type="button" variant="ghost" size="sm" onClick={() => formatBlock("h1")} className="h-8 w-8 p-0">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatBlock("h2")} className="h-8 w-8 p-0">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatBlock("h3")} className="h-8 w-8 p-0">
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("bold")} className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("italic")} className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("underline")}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "blockquote")}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "pre")}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={insertLink} className="h-8 w-8 p-0">
          <LinkIcon className="h-4 w-4" />
        </Button>

        {showImageUpload && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 w-8 p-0"
            >
              {isUploading ? <Upload className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[300px] p-4 focus:outline-none prose prose-invert max-w-none"
        style={{ whiteSpace: "pre-wrap", direction: "ltr" }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
