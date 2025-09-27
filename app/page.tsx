import { HeroSection } from "@/components/portfolio/hero-section"
import { AboutSection } from "@/components/portfolio/about-section"
import { ServicesSection } from "@/components/portfolio/services-section"
import { ProjectsSection } from "@/components/portfolio/projects-section"
import { BlogSection } from "@/components/portfolio/blog-section"
import { ContactSection } from "@/components/portfolio/contact-section"
import { Navigation } from "@/components/portfolio/navigation"
import { NewsletterSignup } from "@/components/portfolio/newsletter-signup"

export default async function HomePage() {
  let portfolioData = null
  let aboutUsData = null

  try {
    const response = await fetch(
      `${process.env.NEXT_FRONTEND_URL || "http://localhost:3000"}/api/portfolio`,
      {
        cache: "no-store",
      }
    )

    if (response.ok) {
      const data = await response.json()
      portfolioData = data.portfolio
      aboutUsData = data.aboutUs
    }
  } catch (error) {
    console.error("Failed to fetch portfolio data:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection portfolio={portfolioData} />
        <AboutSection portfolio={portfolioData} aboutUs={aboutUsData} />
        <ServicesSection />
        <ProjectsSection />
        <BlogSection />
        <NewsletterSignup />
        <ContactSection portfolio={portfolioData} />
      </main>
    </div>
  )
}
