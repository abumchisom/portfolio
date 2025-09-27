"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { PortfolioInfo } from "@/lib/types"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export function PortfolioInfoForm() {
  const [portfolioInfo, setPortfolioInfo] = useState<Partial<PortfolioInfo>>({})
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

      if (error && error.code !== "PGRST116") {
        console.error("Error loading portfolio info:", error)
        return
      }

      if (data) {
        setPortfolioInfo(data)
      }

      // Load about us info
      const { data: aboutData } = await supabase.from("about_us").select("*").single()
      if (aboutData) {
        setAboutUs(aboutData)
      }
    } catch (error) {
      console.error("Error loading portfolio info:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: existingData } = await supabase.from("portfolio_info").select("id").single()

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("portfolio_info")
          .update({
            ...portfolioInfo,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase.from("portfolio_info").insert(portfolioInfo)
        if (error) throw error
      }

      // Save about us info
      const { data: existingAbout } = await supabase.from("about_us").select("id").single()
      if (existingAbout) {
        await supabase
          .from("about_us")
          .update({
            ...aboutUs,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAbout.id)
      } else {
        await supabase.from("about_us").insert(aboutUs)
      }

      toast({
        title: "Success",
        description: "Portfolio information updated successfully!",
      })
    } catch (error) {
      console.error("Error saving portfolio info:", error)
      toast({
        title: "Error",
        description: "Failed to save portfolio information.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof PortfolioInfo, value: string) => {
    setPortfolioInfo((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoadingData) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={portfolioInfo.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={portfolioInfo.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Technical Writer & Cybersecurity Specialist"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={portfolioInfo.tagline || ""}
                onChange={(e) => handleInputChange("tagline", e.target.value)}
                placeholder="A brief tagline about what you do"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <RichTextEditor
                value={portfolioInfo.bio || ""}
                onChange={(value) => handleInputChange("bio", value)}
                placeholder="Tell your story..."
                showImageUpload={false}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={portfolioInfo.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={portfolioInfo.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={portfolioInfo.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={portfolioInfo.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={portfolioInfo.linkedin || ""}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={portfolioInfo.github || ""}
                  onChange={(e) => handleInputChange("github", e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={portfolioInfo.twitter || ""}
                  onChange={(e) => handleInputChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Us Section</CardTitle>
          <CardDescription>
            Configure the about us section for your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setIsLoading(true)
              try {
                const { data: existingAbout } = await supabase
                  .from("about_us")
                  .select("id")
                  .single()

                if (existingAbout) {
                  await supabase
                    .from("about_us")
                    .update({
                      ...aboutUs,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", existingAbout.id)
                } else {
                  await supabase.from("about_us").insert(aboutUs)
                }

                toast({
                  title: "Success",
                  description: "About Us section updated successfully.",
                })
              } catch (error) {
                console.error("Error saving about us info:", error)
                toast({
                  title: "Error",
                  description: "Failed to save about us section.",
                  variant: "destructive",
                })
              } finally {
                setIsLoading(false)
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="about-title">About Us Title</Label>
              <Input
                id="about-title"
                value={aboutUs.title || ""}
                onChange={(e) => setAboutUs({ ...aboutUs, title: e.target.value })}
                placeholder="About Our Services"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about-description">About Us Description</Label>
              <RichTextEditor
                value={aboutUs.description || ""}
                onChange={(value) => setAboutUs({ ...aboutUs, description: value })}
                placeholder="Describe your services and expertise..."
                showImageUpload={false}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
