"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, FolderOpen, Home, Mail, Settings, Users, X } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Portfolio Info", href: "/admin/portfolio", icon: Settings },
  { name: "Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Services", href: "/admin/services", icon: BarChart3 },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Subscribers", href: "/admin/subscribers", icon: Users },
]

type AdminSidebarProps = {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-card border-r border-border transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <h1 className="text-xl font-bold">Portfolio Admin</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <h1 className="text-xl font-bold">Portfolio Admin</h1>
        </div>
        <div className="flex grow flex-col overflow-y-auto bg-card">
          <SidebarContent />
        </div>
      </div>
    </>
  )

  function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
    return (
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  }
}