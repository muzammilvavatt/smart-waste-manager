"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileDrawer } from "@/components/shared/mobile-nav"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const handleMenuClick = useCallback(() => setIsMobileMenuOpen(true), [])
    const handleMenuClose = useCallback(() => setIsMobileMenuOpen(false), [])

    return (
        <div className="flex min-h-screen w-full bg-background font-sans selection:bg-emerald-500/30">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={handleMenuClick} />

                <MobileDrawer
                    isOpen={isMobileMenuOpen}
                    onClose={handleMenuClose}
                />

                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
