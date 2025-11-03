import { HeroSection } from "@/components/portfolio/hero-section"
import { AboutSection } from "@/components/portfolio/about-section"
import { ServicesSection } from "@/components/portfolio/services-section"
import { ProjectsSection } from "@/components/portfolio/projects-section"
import { BlogSection } from "@/components/portfolio/blog-section"
import { ContactSection } from "@/components/portfolio/contact-section"
import { Navigation } from "@/components/portfolio/navigation"
import { NewsletterSignup } from "@/components/portfolio/newsletter-signup"
import { getSupabaseClient } from "@/lib/supabase/server"

export default async function HomePage() {
  let portfolioData = null
  let aboutUsData = null
  let blogs = []

  try {
    // Fetch portfolio data
    const response = await fetch(
      `${process.env.NEXT_FRONTEND_URL || "http://localhost:3000"}/api/portfolio`,
      { cache: "no-store" }
    )

    if (response.ok) {
      const data = await response.json()
      portfolioData = data.portfolio
      aboutUsData = data.aboutUs
    }

    // Fetch blogs from Supabase
    const supabase = await getSupabaseClient()
    const { data: posts, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3) // only show latest 3 on homepage

    if (!error && posts) {
      blogs = posts
    }
  } catch (error) {
    console.error("Failed to fetch home data:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection portfolio={portfolioData} />
        <AboutSection portfolio={portfolioData} aboutUs={aboutUsData} />
        <ServicesSection />
        <ProjectsSection />
        <BlogSection blogs={blogs} />
        <NewsletterSignup />
        <ContactSection portfolio={portfolioData} />
      </main>
    </div>
  )
}
