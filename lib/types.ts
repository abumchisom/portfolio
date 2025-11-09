export interface PortfolioInfo {
  id: string
  name: string
  title: string
  bio?: string
  tagline?: string
  location?: string
  email?: string
  phone?: string
  website?: string
  linkedin?: string
  github?: string
  twitter?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description?: string
  content?: string
  category: "technical-writing" | "cybersecurity"
  featured: boolean
  image_url?: string
  project_url?: string
  github_url?: string
  technologies: string[]
  status: "draft" | "published" | "archived"
  created_at: string
  updated_at: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  category?: string
  canonical_url?: string
  featured: boolean
  image_url?: string
  tags: string[]
  status: "draft" | "published" | "archived"
  published_at?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  title: string
  description?: string
  category: "technical-writing" | "cybersecurity"
  price_range?: string
  features: string[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface Newsletter {
  id: string
  title: string
  subject: string
  content: string
  html_content?: string
  status: "draft" | "scheduled" | "sent"
  scheduled_at?: string
  sent_at?: string
  recipient_count: number
  open_count: number
  click_count: number
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string
  status: "active" | "unsubscribed" | "bounced"
  subscribed_at: string
  unsubscribed_at?: string
  created_at: string
  updated_at: string
}

export interface NewsletterSend {
  id: string
  newsletter_id: string
  subscriber_id: string
  sent_at: string
  opened_at?: string
  clicked_at?: string
  bounced_at?: string
  created_at: string
}
