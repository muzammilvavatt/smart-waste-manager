"use client"

import React, { memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Map,
    Trash2,
    Users,
    BarChart,
    LogOut,
    Home,
    Award,
    Upload,
    Settings,
} from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { UserAvatar } from "@/components/shared/user-avatar"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export const Sidebar = memo(function Sidebar() {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    // Don't show sidebar on root if not logged in
    if (!user) return null

    const citizenLinks = [
        { href: "/dashboard/citizen", label: "Home", icon: Home },
        { href: "/dashboard/citizen/upload", label: "Report Waste", icon: Upload },
        { href: "/dashboard/citizen/rewards", label: "Rewards", icon: Award },
        { href: "/dashboard/citizen/settings", label: "Settings", icon: Settings },
    ]

    const collectorLinks = [
        { href: "/dashboard/collector", label: "Tasks", icon: LayoutDashboard },
        { href: "/dashboard/collector/map", label: "Map View", icon: Map },
        { href: "/dashboard/collector/settings", label: "Settings", icon: Settings },
    ]

    const adminLinks = [
        { href: "/dashboard/admin", label: "Overview", icon: BarChart },
        { href: "/dashboard/admin/users", label: "Users", icon: Users },
        { href: "/dashboard/admin/tasks", label: "All Tasks", icon: Trash2 },
    ]

    let links: { href: string; label: string; icon: React.ElementType }[] = []
    if (user.role === "citizen") links = citizenLinks
    else if (user.role === "collector") links = collectorLinks
    else if (user.role === "admin") links = adminLinks

    const dashboardLink = user.role === "citizen" ? "/dashboard/citizen"
        : user.role === "collector" ? "/dashboard/collector"
            : user.role === "admin" ? "/dashboard/admin"
                : "/"

    return (
        <aside className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 left-0 border-r border-border/60 bg-white dark:bg-[#09090b] z-40 transition-all duration-300 shadow-[2px_0_8px_rgba(0,0,0,0.02)] pt-2 relative">
            <div className="flex h-16 items-center justify-between px-6 mb-4">
                <Link href={dashboardLink} className="hover:opacity-80 transition-opacity">
                    <Logo className="scale-90 origin-left" />
                </Link>
                <div className="scale-90 text-muted-foreground hover:text-foreground transition-colors">
                    <ThemeToggle />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6">
                <div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-3">
                        Main Menu
                    </div>
                    <nav className="grid gap-[2px]">
                        {links.map((link, index) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={index}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 group relative outline-none",
                                        isActive
                                            ? "bg-secondary/60 text-foreground font-medium"
                                            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground font-medium"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[calc(100%-12px)] rounded-r-full bg-primary" />
                                    )}
                                    <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            <div className="p-4 mt-auto border-t border-border/40">
                <div className="flex flex-col rounded-lg bg-secondary/30 p-3 outline outline-1 outline-border/50">
                    <div className="flex items-center gap-3 mb-4">
                        <UserAvatar
                            avatarId={user.profileImage}
                            fallbackName={user.name}
                            className="h-9 w-9 rounded-lg border border-border/50"
                            iconClassName="h-4 w-4"
                        />
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="h-[14px] w-[14px]" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    )
})
