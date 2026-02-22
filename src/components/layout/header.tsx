"use client"

import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"
import { NotificationDropdown } from "./notification-dropdown"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth()
    const {
        notifications,
        unreadCount,
        markAllAsRead,
        clearAll,
        deleteNotification
    } = useNotifications()
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    // Don't show header on auth pages or if not logged in
    if (!user) return null

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/40 bg-white/60 dark:bg-black/40 backdrop-blur-xl px-4 md:px-6 transition-all duration-300">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                    <Menu className="h-6 w-6" />
                </Button>
                <div className="md:hidden">
                    <Logo />
                </div>
                {/* Desktop Search Bar Placeholder - Removed as requested */}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-black"></span>
                        )}
                    </Button>

                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <NotificationDropdown
                                isOpen={isNotificationsOpen}
                                onClose={() => setIsNotificationsOpen(false)}
                                notifications={notifications}
                                onMarkAllRead={markAllAsRead}
                                onClearAll={clearAll}
                                onDelete={(id, e) => {
                                    e.stopPropagation()
                                    deleteNotification(id)
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
