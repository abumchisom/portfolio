"use client";

import type React from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showImageUpload?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      isDragging: {
        default: false,
      },
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes, editor }) => {
      const container = document.createElement("div");
      container.classList.add("relative", "inline-block", "group");

      const img = document.createElement("img");
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (key === "src") {
          img.src = value as string;
        } else if (key === "alt") {
          img.alt = value as string;
        }
      });
      img.classList.add(
        "max-w-full",
        "h-auto",
        "cursor-grab",
        "active:cursor-grabbing",
        "rounded"
      );
      img.draggable = true;

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "✕";
      deleteBtn.classList.add(
        "absolute",
        "top-1",
        "right-1",
        "bg-red-500",
        "text-white",
        "rounded-full",
        "w-6",
        "h-6",
        "flex",
        "items-center",
        "justify-center",
        "opacity-0",
        "group-hover:opacity-100",
        "transition-opacity",
        "text-sm",
        "font-bold"
      );
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        editor.chain().focus().deleteNode("image").run();
      });

      img.addEventListener("dragstart", (e) => {
        e.dataTransfer!.effectAllowed = "move";
      });

      container.appendChild(img);
      container.appendChild(deleteBtn);

      return {
        dom: container,
      };
    };
  },
});

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
  className,
  showImageUpload = true,
  onImageUpload,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Always call useEditor hook, but conditionally provide content
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
      CustomImage.configure({
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your blog post...",
      }),
    ],
    content: isClient ? value : "", // Only provide content on client
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: isClient, // Disable editing during SSR
  });

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !onImageUpload || !editor) return;

      setIsUploading(true);
      try {
        const imageUrl = await onImageUpload(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [editor, onImageUpload]
  );

  const insertLink = useCallback(() => {
    if (!editor) return;
    const url = prompt("Enter URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div
        className={cn("border border-border rounded-md bg-card p-4", className)}
      >
        <p className="text-muted-foreground text-sm">Loading editor...</p>
      </div>
    );
  }

  // Show error state if editor failed to initialize
  if (!editor) {
    return (
      <div
        className={cn("border border-border rounded-md bg-card p-4", className)}
      >
        <p className="text-muted-foreground text-sm">
          Failed to initialize editor
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border border-border rounded-md overflow-hidden bg-card",
        className
      )}
    >
      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        {/* Text Formatting */}
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          variant={
            editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          variant={
            editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          variant={
            editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          variant={editor.isActive("underline") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Lists & Quotes */}
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Alignment */}
        <Button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setNode("paragraph", { textAlign: "left" })
              .run()
          }
          variant={
            editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setNode("paragraph", { textAlign: "center" })
              .run()
          }
          variant={
            editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setNode("paragraph", { textAlign: "right" })
              .run()
          }
          variant={
            editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Links & Images */}
        <Button
          onClick={insertLink}
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        {showImageUpload && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            title="Upload Image"
          >
            {isUploading ? (
              <span className="h-4 w-4 animate-spin">⟳</span>
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </Button>
        )}

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Undo/Redo */}
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm min-h-[300px] p-4 focus:outline-none",
          "dark:prose-invert",
          "prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-foreground",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4",
          "prose-img:rounded prose-img:shadow-sm"
        )}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}