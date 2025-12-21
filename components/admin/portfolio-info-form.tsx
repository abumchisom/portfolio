"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { PortfolioInfo } from "@/lib/types"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export function PortfolioInfoForm() {
  const [portfolioInfo, setPortfolioInfo] = useState<Partial<PortfolioInfo>>({})
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [aboutUs, setAboutUs] = useState({ title: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadPortfolioInfo()
  }, [])

  const loadPortfolioInfo = async () => {
    try {
      const { data, error } = await supabase.from("portfolio_info").select("*").single()
      if (error && error.code !== "PGRST116") throw error
      if (data) setPortfolioInfo(data)

      const { data: aboutData } = await supabase.from("about_us").select("*").single()
      if (aboutData) setAboutUs(aboutData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let updatedProfileImage = portfolioInfo.profile_image
      if (profileImageFile) {
        const fileName = `private/profile-${Date.now()}-${profileImageFile.name}`
        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(fileName, profileImageFile, { upsert: false })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(fileName)
        updatedProfileImage = urlData.publicUrl
      }

      const { data: existing } = await supabase.from("portfolio_info").select("id").single()

      const portfolioData = {
        ...portfolioInfo,
        profile_image: updatedProfileImage,
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        await supabase.from("portfolio_info").update(portfolioData).eq("id", existing.id)
      } else {
        await supabase.from("portfolio_info").insert(portfolioData)
      }

      // Save about us
      const { data: existingAbout } = await supabase.from("about_us").select("id").single()
      if (existingAbout) {
        await supabase.from("about_us").update({ ...aboutUs, updated_at: new Date().toISOString() }).eq("id", existingAbout.id)
      } else {
        await supabase.from("about_us").insert(aboutUs)
      }

      toast({ title: "Success", description: "Portfolio information saved!" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProfileImageFile(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPortfolioInfo((p) => ({ ...p, profile_image: ev.target?.result as string }))
      reader.readAsDataURL(file)
    }
  }

  if (isLoadingData) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold">Portfolio Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Update your personal and about section information</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Personal Information */}
        <div className="border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="font-medium text-lg">Personal Information</h2>
            <p className="text-sm text-muted-foreground mt-1">Update your personal details and contact info</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={portfolioInfo.name || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={portfolioInfo.title || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-image">Profile Image</Label>
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <Input id="profile-image" type="file" accept="image/*" onChange={handleImageChange} />
                {portfolioInfo.profile_image && (
                  <img
                    src={portfolioInfo.profile_image as string}
                    alt="Preview"
                    className="w-28 h-28 rounded-full object-cover border border-border"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={portfolioInfo.tagline || ""}
                onChange={(e) => setPortfolioInfo((p) => ({ ...p, tagline: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Bio</Label>
              <RichTextEditor
                value={portfolioInfo.bio || ""}
                onChange={(v) => setPortfolioInfo((p) => ({ ...p, bio: v }))}
                showImageUpload={false}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={portfolioInfo.location || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, location: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={portfolioInfo.email || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={portfolioInfo.phone || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={portfolioInfo.website || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={portfolioInfo.linkedin || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, linkedin: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={portfolioInfo.github || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, github: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input
                  id="twitter"
                  value={portfolioInfo.twitter || ""}
                  onChange={(e) => setPortfolioInfo((p) => ({ ...p, twitter: e.target.value }))}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>

        {/* About Us Section */}
        <div className="border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="font-medium text-lg">About Us Section</h2>
            <p className="text-sm text-muted-foreground mt-1">Content for the about section on your portfolio</p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setIsLoading(true)
              try {
                const { data: existing } = await supabase.from("about_us").select("id").single()
                if (existing) {
                  await supabase.from("about_us").update({ ...aboutUs, updated_at: new Date().toISOString() }).eq("id", existing.id)
                } else {
                  await supabase.from("about_us").insert(aboutUs)
                }
                toast({ title: "Success", description: "About section saved!" })
              } catch {
                toast({ title: "Error", description: "Failed to save about section.", variant: "destructive" })
              } finally {
                setIsLoading(false)
              }
            }}
            className="p-6 space-y-6"
          >
            <div className="space-y-1.5">
              <Label htmlFor="about-title">Title</Label>
              <Input
                id="about-title"
                value={aboutUs.title}
                onChange={(e) => setAboutUs((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <RichTextEditor
                value={aboutUs.description}
                onChange={(v) => setAboutUs((p) => ({ ...p, description: v }))}
                showImageUpload={false}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save About Section"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}