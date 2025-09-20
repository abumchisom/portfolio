import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground text-balance">Alex Thompson</h1>
            <p className="text-xl sm:text-2xl text-muted-foreground font-light">
              Technical Writer & Cybersecurity Specialist
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              <em className="text-foreground">Crafting clear documentation</em> and securing digital landscapes.
              Building polished technical content and robust security solutions. Experimenting with innovative
              approaches to complex technical challenges.
            </p>

            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              In the past I've developed comprehensive documentation systems, security protocols, and educational
              content for startups and enterprises.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="#projects">
                View My Work <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#contact">Get In Touch</Link>
            </Button>
          </div>

          <div className="flex gap-6 pt-4">
            <Link
              href="https://github.com/alexthompson"
              className="text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com/in/alexthompson"
              className="text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:alex@example.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
