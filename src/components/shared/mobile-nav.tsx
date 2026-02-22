"use client"

import { Button } from "@/components/ui/button"
import { Menu, Trash2, Home, Upload, Award, LayoutDashboard, Map, BarChart, Users, LogOut, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Logo } from "./logo"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    if (!user) return null

    const citizenLinks = [
        { href: "/dashboard/citizen", label: "Home", icon: Home },
        { href: "/dashboard/citizen/upload", label: "Report Waste", icon: Upload },
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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-3/4 max-w-xs bg-background/95 backdrop-blur-xl border-r border-border/50 p-6 shadow-2xl flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <Link href="/" onClick={onClose}>
                                <Logo />
                            </Link>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2 flex-1">
                            {links.map((link, index) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-white/10",
                                            pathname === link.href
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="border-t border-border/50 pt-4 mt-auto">
                            <div className="flex items-center gap-3 px-3 py-2 mb-2">
                                <div className="font-medium text-foreground">{user.name}</div>
                            </div>
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
