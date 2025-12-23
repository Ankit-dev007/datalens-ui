"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileScan, Database, MessageSquare, Network, Settings, Shield, List, ClipboardList, UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Scan Files", href: "/scan/files", icon: FileScan },
  { name: "Scan Database", href: "/scan/database", icon: Database },
  { name: "Query Assistant", href: "/ask", icon: MessageSquare },
  { name: "Graph View", href: "/graph", icon: Network },
  { name: "ROPA & Mapping", href: "/activities", icon: List }, // Using List icon for Activities
  { name: "Manual Entry", href: "/manual", icon: ClipboardList },
  { name: "Import", href: "/import", icon: Database },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="flex items-center gap-2 p-6 border-b">
        <Shield className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          DataLens
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </div>
  )
}
