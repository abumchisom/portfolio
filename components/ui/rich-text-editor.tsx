"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showImageUpload?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  showImageUpload = true,
  onImageUpload,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
  });

  useEffect(() => {
    const handleSelectionChange = () => {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        h1: document.queryCommandValue("formatBlock") === "h1",
        h2: document.queryCommandValue("formatBlock") === "h2",
      });
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = useCallback(
    (command: string, value?: string) => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      execCommand("insertImage", imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const formatBlock = (tag: string) => {
    execCommand("formatBlock", tag);
  };

  return (
    <div
      className={cn(
        "border border-border rounded-md overflow-hidden bg-card",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant={activeFormats.h1 ? "secondary" : "ghost"} // 👈 highlight if active
          size="sm"
          onClick={() => formatBlock("h1")}
          className={cn(
            "h-8 w-8 p-0 hover:bg-muted",
            activeFormats.h1 && "bg-muted" // fallback if variant isn't styled
          )}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.h2 ? "secondary" : "ghost"}
          size="sm"
          onClick={() => formatBlock("h2")}
          className={cn(
            "h-8 w-8 p-0 hover:bg-muted",
            activeFormats.h2 && "bg-muted"
          )}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button
          type="button"
          variant={activeFormats.bold ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCommand("bold")}
          className={cn(
            "h-8 w-8 p-0 hover:bg-muted",
            activeFormats.bold && "bg-muted"
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={activeFormats.italic ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCommand("italic")}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.underline ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCommand("underline")}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "blockquote")}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "pre")}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
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
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              {isUploading ? (
                <span className="h-4 w-4 animate-spin">⟳</span>
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-4 focus:outline-none text-base leading-relaxed text-left prose"
        style={{
          whiteSpace: "pre-wrap",
          direction: "ltr",
          unicodeBidi: "plaintext",
          display: "block",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        h1 {
          font-size: 1.875rem; /* text-3xl */
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        h2 {
          font-size: 1.5rem; /* text-2xl */
          font-weight: bold;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
