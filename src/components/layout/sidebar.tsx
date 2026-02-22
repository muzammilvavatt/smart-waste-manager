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
    Bell
} from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/shared/logo"
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
        <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 left-0 border-r border-border/40 bg-white/60 dark:bg-black/40 backdrop-blur-xl z-40 transition-all duration-300">
            <div className="flex h-20 items-center justify-between px-6 border-b border-border/40">
                <Link href={dashboardLink} className="hover:opacity-80 transition-opacity">
                    <Logo />
                </Link>
                <div className="scale-90">
                    <ThemeToggle />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    Menu
                </div>
                <nav className="grid gap-1">
                    {links.map((link, index) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={index}
                                href={link.href}
                                className={cn(
                                    "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "text-primary-foreground font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-tab"
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-3">
                                    <Icon className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "")} />
                                    <span className={isActive ? "text-white" : ""}>{link.label}</span>
                                </span>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-sm z-10"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border/40 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                <div className="rounded-xl border border-border/50 bg-white/50 dark:bg-white/5 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-bold shadow-sm">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button
                            onClick={logout}
                            className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
})
