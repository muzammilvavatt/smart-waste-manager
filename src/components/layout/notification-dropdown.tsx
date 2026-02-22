import { motion } from "framer-motion"
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

import { Notification } from "@/contexts/notification-context"

// Removed initialNotifications as they are now handled in context

interface NotificationDropdownProps {
    isOpen: boolean
    onClose: () => void
    notifications: Notification[]
    onMarkAllRead: () => void
    onClearAll: () => void
    onDelete: (id: string, e: React.MouseEvent) => void
}

export function NotificationDropdown({
    isOpen,
    onClose,
    notifications,
    onMarkAllRead,
    onClearAll,
    onDelete
}: NotificationDropdownProps) {
    const unreadCount = notifications.filter(n => !n.read).length

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 z-50 w-80 md:w-96 rounded-xl border border-border/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={onMarkAllRead}
                                title="Mark all as read"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={onClearAll}
                            title="Clear all"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-1">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground">
                            <Bell className="h-10 w-10 opacity-20 mb-2" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "relative group flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-default",
                                        !notification.read && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    <div className={cn(
                                        "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                        notification.type === "info" && "bg-blue-500/10 text-blue-500",
                                        notification.type === "success" && "bg-emerald-500/10 text-emerald-500",
                                        notification.type === "warning" && "bg-orange-500/10 text-orange-500",
                                        notification.type === "error" && "bg-red-500/10 text-red-500"
                                    )}>
                                        {notification.type === "info" && <Info className="h-4 w-4" />}
                                        {notification.type === "success" && <CheckCircle className="h-4 w-4" />}
                                        {notification.type === "warning" && <AlertTriangle className="h-4 w-4" />}
                                        {notification.type === "error" && <AlertTriangle className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={cn("text-sm font-medium leading-none", !notification.read && "text-primary")}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => onDelete(notification.id, e)}
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-2 border-t border-border/50 bg-muted/30">
                        <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground hover:text-foreground">
                            View all notifications
                        </Button>
                    </div>
                )}
            </motion.div>
        </>
    )
}
