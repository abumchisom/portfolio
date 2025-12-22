"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Logo() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  // Ensure we only render the correct logo after mounting (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Default to light logo during SSR or before mount
  const logoSrc = mounted && resolvedTheme === "dark" 
    ? "/abum-light.png" 
    : "/abum.png"

  return (
    <Image
      src={logoSrc}
      alt="Joseph Ofonagoro Chisom"
      width={180}
      height={40}
      className="h-10 w-auto object-contain"
      priority
    />
  )
}