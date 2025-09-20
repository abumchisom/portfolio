"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { PortfolioInfo } from "@/lib/types"

export function PortfolioInfoForm() {
  const [portfolioInfo, setPortfolioInfo] = useState<Partial<PortfolioInfo>>({})
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
            <Textarea
              id="bio"
              value={portfolioInfo.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell your story..."
              rows={4}
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
  )
}
