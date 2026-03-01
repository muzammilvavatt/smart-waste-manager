"use client"

import { Bell, Menu, LogOut } from "lucide-react"
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
    const { user, logout } = useAuth()
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

    const isCitizen = user.role === "citizen"

    return (
        <header className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-2 sm:px-4 md:px-8 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="md:hidden">
                    <Logo className="scale-90 origin-left" />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors h-9 w-9"
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    >
                        <Bell className="h=[18px] w-[18px]" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
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

                {/* Mobile-only Sign Out button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors h-9 w-9"
                    onClick={logout}
                    title="Sign Out"
                >
                    <LogOut className="h-[18px] w-[18px]" />
                </Button>
            </div>
        </header>
    )
}
