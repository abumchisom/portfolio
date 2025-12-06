"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  portfolio?: {
    name?: string
    title?: string
    bio?: string
    tagline?: string
    github?: string
    linkedin?: string
    email?: string
  } | null
}

export function HeroSection({ portfolio }: HeroSectionProps) {
  const [typedName, setTypedName] = useState("")
  const [typedTitle, setTypedTitle] = useState("")
  const [phase, setPhase] = useState(1)
  const fullName = portfolio?.name || "Your Name"
  const fullTitle = portfolio?.title || "Your Professional Title"

  useEffect(() => {
    if (phase === 1) {
      let index = 0
      const timer = setInterval(() => {
        if (index < fullName.length) {
          setTypedName(fullName.substring(0, index + 1))
          index++
        } else {
          setTypedName(fullName)
          setPhase(2)
          clearInterval(timer)
        }
      }, 100)

      return () => clearInterval(timer)
    } else if (phase === 2) {
      let index = 0
      const timer = setInterval(() => {
        if (index < fullTitle.length) {
          setTypedTitle(fullTitle.substring(0, index + 1))
          index++
        } else {
          setTypedTitle(fullTitle)
          clearInterval(timer)
        }
      }, 100)

      return () => clearInterval(timer)
    }
  }, [phase, fullName, fullTitle])

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle gradient background with fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      <div className="relative max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-balance bg-primary bg-clip-text text-transparent tracking-[-0.02em] animate-fade-in">
              {typedName}
              {phase === 1 && <span className="inline-block w-1 h-10 sm:h-14 bg-foreground animate-pulse ml-1">|</span>}
            </h1>
            <p className={`text-xl sm:text-2xl font-light animate-delay-300 animate-fade-in tracking-[-0.02em] transition-colors duration-300 ${
              phase === 2
                ? "bg-primary/70 bg-clip-text text-transparent"
                : "text-muted-foreground"
            }`}>
              {typedTitle}
              {phase === 2 && <span className="inline-block w-1 h-[1.25em] sm:h-[1.5em] bg-primary/70 animate-pulse ml-1">|</span>}
            </p>
          </div>

          {/* Uncomment and style bio if needed */}
          {/* <div className="space-y-6 animate-delay-600 animate-fade-in">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {portfolio?.bio
                ? ` ${portfolio.bio.substring(0, 200)}...`
                : " Your professional bio and description of what you do."}
            </p>

            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              In the past I've developed comprehensive documentation systems, security protocols, and educational
              content for startups and enterprises.
            </p>
          </div> */}

          <div className="flex flex-wrap gap-4 animate-delay-900 animate-fade-in">
            <Button asChild size="lg">
              <Link href="#projects">
                View My Work <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#contact">Get In Touch</Link>
            </Button>
          </div>

          <div className="flex gap-6 pt-4 animate-delay-1200 animate-fade-in">
            {portfolio?.github && (
              <Link
                href={portfolio.github}
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </Link>
            )}
            {portfolio?.linkedin && (
              <Link
                href={portfolio.linkedin}
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            )}
            {portfolio?.email && (
              <Link
                href={`mailto:${portfolio.email}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}