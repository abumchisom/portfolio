import { prisma } from "./prisma"
import { createServerClient } from "./supabase/server"

// Prisma client for ORM operations
export { prisma }

// Supabase client for auth and real-time features
export const getSupabaseClient = () => {
  return createServerClient()
}

// Helper functions for common database operations
export const dbHelpers = {
  // Portfolio operations
  async getPortfolioInfo() {
    return await prisma.portfolioInfo.findFirst()
  },

  async updatePortfolioInfo(data: any) {
    const existing = await prisma.portfolioInfo.findFirst()
    if (existing) {
      return await prisma.portfolioInfo.update({
        where: { id: existing.id },
        data,
      })
    } else {
      return await prisma.portfolioInfo.create({ data })
    }
  },

  // Project operations
  async getProjects(category?: string) {
    return await prisma.project.findMany({
      where: category ? { category: category as any } : undefined,
      include: { author: true },
      orderBy: { createdAt: "desc" },
    })
  },

  async getFeaturedProjects() {
    return await prisma.project.findMany({
      where: { featured: true, published: true },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    })
  },

  // Blog operations
  async getPublishedBlogs() {
    return await prisma.blog.findMany({
      where: { published: true },
      include: { author: true },
      orderBy: { publishedAt: "desc" },
    })
  },

  async getBlogBySlug(slug: string) {
    return await prisma.blog.findUnique({
      where: { slug },
      include: { author: true },
    })
  },

  // Newsletter operations
  async getActiveSubscribers() {
    return await prisma.subscriber.findMany({
      where: { status: "ACTIVE" },
    })
  },

  async subscribeEmail(email: string, name?: string) {
    return await prisma.subscriber.upsert({
      where: { email },
      update: { status: "ACTIVE" },
      create: { email, name, status: "ACTIVE" },
    })
  },
}
