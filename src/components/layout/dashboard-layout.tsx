"use client"

import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const isCitizen = user?.role === "citizen"

    return (
        <div className="flex min-h-screen w-full bg-background/50 text-foreground font-sans selection:bg-primary/30 relative">
            {/* Premium Dashboard Background Glow */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <div className="relative z-10 flex w-full">
                <Sidebar />

                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <main className={cn(
                        "flex-1 overflow-y-auto overflow-x-hidden relative",
                        "pb-[80px] md:pb-0" // Add padding to bottom for mobile layout floating dock
                    )}>
                        <div className="p-4 md:p-6 lg:p-8 mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {children}
                        </div>
                    </main>

                    <BottomNav />
                </div>
            </div>
        </div>
    )
}
