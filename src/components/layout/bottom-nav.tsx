"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Upload, Gift, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"

export function BottomNav() {
    const pathname = usePathname()
    const { user } = useAuth()

    if (!user) return null

    const citizenLinks = [
        { href: "/dashboard/citizen", label: "Home", icon: Home },
        { href: "/dashboard/citizen/upload", label: "Report", icon: Upload },
        { href: "/dashboard/citizen/rewards", label: "Rewards", icon: Gift },
        { href: "/dashboard/citizen/settings", label: "Settings", icon: Settings },
    ]

    const collectorLinks = [
        { href: "/dashboard/collector", label: "Tasks", icon: Home },
        { href: "/dashboard/collector/map", label: "Map", icon: Upload }, // Using Upload icon for Map as placeholder or Map icon
        { href: "/dashboard/collector/settings", label: "Settings", icon: Settings },
    ]

    const adminLinks = [
        { href: "/dashboard/admin", label: "Overview", icon: Home },
        { href: "/dashboard/admin/users", label: "Users", icon: Users },
        { href: "/dashboard/admin/tasks", label: "Tasks", icon: Upload },
    ]

    let activeLinks = citizenLinks;
    if (user.role === 'collector') activeLinks = collectorLinks;
    if (user.role === 'admin') activeLinks = adminLinks;

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <nav className="flex justify-around items-center h-[68px] px-2 rounded-3xl bg-background/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]">
                {activeLinks.map((link) => {
                    const Icon = link.icon
                    // For the root dashboard, we only want to match exactly
                    const isRoot = link.href === "/dashboard/citizen" || link.href === "/dashboard/collector" || link.href === "/dashboard/admin";
                    const isExactMatch = pathname === link.href
                    const isActive = isRoot ? isExactMatch : pathname?.startsWith(link.href)

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative flex flex-col items-center justify-center w-full h-full outline-none tap-highlight-transparent group"
                        >
                            <div className="relative flex flex-col items-center justify-center space-y-1.5 z-10 w-full">
                                <div className={cn(
                                    "flex items-center justify-center rounded-2xl w-12 h-8 transition-all duration-300",
                                    isActive ? "bg-emerald-500/15 dark:bg-emerald-500/20 scale-110" : "bg-transparent group-hover:bg-emerald-500/5 group-hover:scale-105"
                                )}>
                                    <Icon className={cn(
                                        "h-5 w-5 transition-all duration-300",
                                        isActive ? "text-emerald-600 dark:text-emerald-400 drop-shadow-sm" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-semibold tracking-tight transition-all duration-300",
                                    isActive ? "text-emerald-600 dark:text-emerald-400 translate-y-0 opacity-100" : "text-muted-foreground translate-y-0.5 opacity-80 group-hover:opacity-100 group-hover:text-foreground"
                                )}>
                                    {link.label}
                                </span>
                            </div>

                            {/* Active indicator dot */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
