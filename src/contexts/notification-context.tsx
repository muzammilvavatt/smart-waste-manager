"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface Notification {
    id: string
    title: string
    message: string
    time: string
    type: "info" | "warning" | "success" | "error"
    read: boolean
    createdAt: number // timestamp for sorting/formatting
    targetRole?: "citizen" | "collector" | "admin" // null or undefined means all roles
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    addNotification: (type: Notification["type"], title: string, message: string) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    deleteNotification: (id: string) => void
    clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
}

import { useAuth } from "@/contexts/auth-context"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("swm_notifications")
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setNotifications(parsed)
            } catch (e) {
                console.error("Failed to parse notifications", e)
            }
        } else {
            // Optional: Add default welcome notification for new users
            const welcomeCitizen: Notification = {
                id: "welcome-citizen",
                title: "Welcome to Citizen Dashboard!",
                message: "Here you can report waste and track your collection schedule.",
                time: "Just now",
                type: "info",
                read: false,
                createdAt: Date.now(),
                targetRole: "citizen"
            }
            const welcomeAdmin: Notification = {
                id: "welcome-admin",
                title: "Admin Dashboard Ready",
                message: "You can now manage users, tasks, and system settings.",
                time: "Just now",
                type: "info",
                read: false,
                createdAt: Date.now(),
                targetRole: "admin"
            }
            const welcomeCollector: Notification = {
                id: "welcome-collector",
                title: "Collector Portal Active",
                message: "Check your assigned tasks and update collection statuses.",
                time: "Just now",
                type: "info",
                read: false,
                createdAt: Date.now(),
                targetRole: "collector"
            }
            setNotifications([welcomeCitizen, welcomeAdmin, welcomeCollector])
        }
        setIsLoading(false)
    }, [])

    // Sync to localStorage whenever notifications change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem("swm_notifications", JSON.stringify(notifications))
        }
    }, [notifications, isLoading])

    const addNotification = (type: Notification["type"], title: string, message: string, targetRole?: "citizen" | "collector" | "admin") => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            time: "Just now", // In a real app, use relative time library like date-fns
            type,
            read: false,
            createdAt: Date.now(),
            targetRole
        }
        setNotifications(prev => [newNotification, ...prev])
    }

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const clearAll = () => {
        setNotifications([])
    }

    // Filter notifications based on current user role
    const filteredNotifications = notifications.filter(n =>
        !n.targetRole || (user && n.targetRole === user.role)
    )

    const unreadCount = filteredNotifications.filter(n => !n.read).length

    return (
        <NotificationContext.Provider value={{
            notifications: filteredNotifications,
            unreadCount,
            isLoading,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    )
}
