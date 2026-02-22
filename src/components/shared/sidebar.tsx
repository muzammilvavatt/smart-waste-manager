"use client"

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
    Upload
} from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "./logo"

import { ThemeToggle } from "./theme-toggle"

export function Sidebar() {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    // Don't show sidebar on auth pages or root if not logged in
    if (!user || pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register")) {
        return null
    }

    const citizenLinks = [
        { href: "/dashboard/citizen", label: "Home", icon: Home },
        { href: "/dashboard/citizen/upload", label: "Report Waste", icon: Upload }, // Will use modal or page, let's say page for now
        { href: "/dashboard/citizen/rewards", label: "Rewards", icon: Award },
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

    return (
        <div className="hidden border-r bg-white dark:bg-gray-800 md:block md:w-64 lg:w-72 md:sticky md:top-0 md:h-screen">
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between border-b px-6">
                    <Link href="/">
                        <Logo />
                    </Link>
                    <ThemeToggle />
                </div>
                <div className="flex-1 overflow-auto py-6">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {links.map((link, index) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={index}
                                    href={link.href}
                                    className={cn(
                                        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                                        isActive ? "text-gray-900 dark:text-gray-50" : ""
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-800"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-3">
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <div className="mt-auto border-t p-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">{user.name}</p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-50"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
