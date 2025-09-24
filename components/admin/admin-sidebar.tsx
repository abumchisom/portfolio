"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, FolderOpen, Home, Mail, Menu, Settings, Users, X } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Portfolio Info", href: "/admin/portfolio", icon: Settings },
  { name: "Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Services", href: "/admin/services", icon: BarChart3 },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Subscribers", href: "/admin/subscribers", icon: Users },
]

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn("lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 z-50 flex">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex h-10 w-10 items-center justify-center"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <SidebarContent />
          </div>
          <div className="w-14 flex-shrink-0" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6 pb-4">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-background px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-sm font-semibold leading-6 text-foreground">Admin Dashboard</div>
      </div>
    </>
  )

  function SidebarContent() {
    return (
      <>
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-foreground">Portfolio Admin</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors",
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </>
    )
  }
}
