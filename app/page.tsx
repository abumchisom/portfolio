import { HeroSection } from "@/components/portfolio/hero-section"
import { AboutSection } from "@/components/portfolio/about-section"
import { ServicesSection } from "@/components/portfolio/services-section"
import { ProjectsSection } from "@/components/portfolio/projects-section"
import { BlogSection } from "@/components/portfolio/blog-section"
import { ContactSection } from "@/components/portfolio/contact-section"
import { Navigation } from "@/components/portfolio/navigation"
import { NewsletterSignup } from "@/components/portfolio/newsletter-signup"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <BlogSection />
        <NewsletterSignup />
        <ContactSection />
      </main>
    </div>
  )
}
