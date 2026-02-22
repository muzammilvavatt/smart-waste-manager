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

export function NotificationProvider({ children }: { children: React.ReactNode }) {
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
            const welcome: Notification = {
                id: Date.now().toString(),
                title: "Welcome!",
                message: "Welcome to Smart Waste Manager. Notifications will appear here.",
                time: "Just now",
                type: "info",
                read: false,
                createdAt: Date.now()
            }
            setNotifications([welcome])
        }
        setIsLoading(false)
    }, [])

    // Sync to localStorage whenever notifications change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem("swm_notifications", JSON.stringify(notifications))
        }
    }, [notifications, isLoading])

    const addNotification = (type: Notification["type"], title: string, message: string) => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            time: "Just now", // In a real app, use relative time library like date-fns
            type,
            read: false,
            createdAt: Date.now()
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

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <NotificationContext.Provider value={{
            notifications,
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
