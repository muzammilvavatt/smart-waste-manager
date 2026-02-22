"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"

import { Toaster } from "react-hot-toast"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                <NotificationProvider>
                    <Toaster position="top-center" />
                    {children}
                </NotificationProvider>
            </AuthProvider>
        </SessionProvider>
    )
}
