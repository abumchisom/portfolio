"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface HeroSectionProps {
  portfolio?: {
    name?: string
    title?: string
    bio?: string
    tagline?: string
    github?: string
    linkedin?: string
    email?: string
    profile_image?: string
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
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle gradient background with fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance bg-primary bg-clip-text text-transparent tracking-[-0.02em] animate-fade-in">
                {typedName}
                {phase === 1 && <span className="inline-block w-1 h-10 sm:h-14 bg-foreground animate-pulse ml-1">|</span>}
              </h1>
              <p className={`text-lg sm:text-xl md:text-2xl font-light animate-delay-300 animate-fade-in tracking-[-0.02em] transition-colors duration-300 ${
                phase === 2
                  ? "bg-primary/70 bg-clip-text text-transparent"
                  : "text-muted-foreground"
              }`}>
                {typedTitle}
                {phase === 2 && <span className="inline-block w-1 h-[1.25em] sm:h-[1.5em] bg-primary/70 animate-pulse ml-1">|</span>}
              </p>
            </div>

            {/* Bio Section - Optional */}
            {/* {portfolio?.bio && (
              <div className="space-y-4 animate-delay-600 animate-fade-in">
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {portfolio.bio.substring(0, 200)}
                  {portfolio.bio.length > 200 && "..."}
                </p>
              </div>
            )} */}

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 animate-delay-900 animate-fade-in">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="#projects">
                  View My Work <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href="#contact">Get In Touch</Link>
              </Button>
            </div>

            {/* Social Links */}
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

          {/* Right Column - Photo */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end items-center">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <Image
                src={portfolio?.profile_image || "/photo.jpg"}
                alt={`${portfolio?.name || "Profile"} photo`}
                fill
                className="rounded-full object-cover border-4 border-primary/20 shadow-2xl shadow-primary/20 animate-fade-in"
                sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                priority
              />
              
              {/* Optional decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}