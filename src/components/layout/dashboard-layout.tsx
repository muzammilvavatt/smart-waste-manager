"use client"

import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const isCitizen = user?.role === "citizen"

    return (
        <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-background font-sans selection:bg-emerald-500/30">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <main className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden relative",
                    "pb-[80px] md:pb-0" // Add padding to bottom for all mobile layout floating dock
                )}>
                    {/* Top ambient glow for dashboard */}
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

                    <div className="p-4 md:p-6 lg:p-8 mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>

                <BottomNav />
            </div>
        </div>
    )
}
