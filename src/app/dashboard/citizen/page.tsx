
























































































































































































































"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getTasks } from "@/lib/store"
import { CollectionTask } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Leaf, MapPin, Calendar, Clock, Loader2, Trophy, Plus, FileText, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { UserAvatar } from "@/components/shared/user-avatar"

export default function CitizenDashboard() {
    const { user, logout } = useAuth()
    const [tasks, setTasks] = useState<CollectionTask[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTasks() {
            if (user) {
                try {
                    const data = await getTasks("citizen", user.id)
                    setTasks(data)
                } catch (error) {
                    console.error("Failed to fetch tasks", error)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchTasks()
    }, [user])

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }

    const pendingTasks = tasks.filter(t => t.status === 'pending').length;

    return (
        <motion.div
            className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
            initial="hidden"
            animate="show"
            variants={container}
        >
            {/* App-like Header for Mobile */}
            <div className="md:hidden flex items-center justify-between pb-2 sm:pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <UserAvatar
                        avatarId={user?.profileImage}
                        fallbackName={user?.name || "U"}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-[1.25rem] shadow-inner border border-emerald-500/20"
                        iconClassName="h-6 w-6 sm:h-7 sm:w-7"
                    />
                    <div>
                        <p className="text-[13px] sm:text-sm font-medium text-muted-foreground tracking-tight">
                            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
                        </p>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{user?.name?.split(' ')[0]}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/citizen/rewards">
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 pr-4 rounded-full border border-border/60 shadow-sm transition-transform active:scale-95">
                            <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                                <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <span className="font-bold text-sm tracking-tight">{user?.points || 0} <span className="text-muted-foreground hidden sm:inline">pts</span></span>
                        </div>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => logout()} className="text-muted-foreground ml-1">
                        <LogOut className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
            </div>

            {/* Traditional Header for Desktop */}
            <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4 pb-4 border-b border-border/40">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.name?.split(' ')[0]}</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Here's an overview of your eco-impact.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link href="/dashboard/citizen/upload" className="w-full sm:w-auto">
                        <Button className="w-full gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] bg-emerald-600 hover:bg-emerald-700 font-semibold h-11 sm:h-10 text-white">
                            <Plus className="h-4 w-4" /> Report Waste
                        </Button>
                    </Link>
                    <Link href="/dashboard/citizen/rewards/leaderboard" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full gap-2 shadow-sm font-semibold h-11 sm:h-10">
                            <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Prominent Action Card (Mobile Only) */}
            <motion.div variants={item} className="md:hidden">
                <Link href="/dashboard/citizen/upload" className="block w-full outline-none tap-highlight-transparent">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-700 p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/20 transition-transform active:scale-[0.98]">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-black/10 blur-2xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-[1rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                                <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Report Waste</h2>
                                <p className="text-emerald-50/90 text-[13px] sm:text-sm mt-1.5 font-medium max-w-[260px] leading-relaxed">
                                    Snap a photo and earn points for keeping our city clean.
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Stats Scroll (Mobile Horizontal, Desktop Grid) */}
            <motion.div variants={item} className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6 gap-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="min-w-[240px] sm:min-w-0 snap-center">
                    <KpiCard
                        title="Total Points"
                        value={user?.points || 0}
                        icon={Leaf}
                        description="From approved reports"
                        className="rounded-[1.5rem]"
                    />
                </div>
                <div className="min-w-[240px] sm:min-w-0 snap-center">
                    <KpiCard
                        title="Lifetime Reports"
                        value={tasks.length}
                        icon={MapPin}
                        description="Contributions to the city"
                        className="rounded-[1.5rem]"
                    />
                </div>
                <div className="min-w-[240px] sm:min-w-0 snap-center">
                    <KpiCard
                        title="Pending Pickups"
                        value={pendingTasks}
                        icon={Clock}
                        description="Awaiting collection"
                        className="border-orange-200 dark:border-orange-900/40 rounded-[1.5rem]"
                    />
                </div>
            </motion.div>

            {/* Highlighted Leaderboard CTA */}
            <motion.div variants={item} className="md:hidden">
                <Link href="/dashboard/citizen/rewards/leaderboard" className="block w-full outline-none tap-highlight-transparent group">
                    <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-orange-500/10 border border-yellow-500/20 dark:border-yellow-500/10 p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] hover:shadow-md hover:shadow-yellow-500/5 hover:border-yellow-500/30">
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />

                        <div className="flex items-center justify-between relative z-10 gap-4">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-inner shadow-yellow-200/50">
                                    <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                        Green Leaderboard
                                        <span className="hidden sm:inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-800 dark:text-yellow-500">Live</span>
                                    </h2>
                                    <p className="text-sm font-medium text-muted-foreground mt-0.5">See top contributors to a cleaner city.</p>
                                </div>
                            </div>
                            <div className="h-10 w-10 shrink-0 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500 text-yellow-600 dark:text-yellow-500 group-hover:text-white transition-colors border border-yellow-500/20 group-hover:border-transparent">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            <motion.div variants={item}>
                <Card className="rounded-[1.5rem] bg-transparent sm:bg-card border-none sm:border-solid sm:border-border/40 shadow-none sm:shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between px-2 sm:px-6 p-0 sm:p-6 sm:border-b border-border/40 sm:bg-muted/20 pb-4">
                        <div className="flex items-center justify-between w-full sm:w-auto">
                            <CardTitle className="text-xl sm:text-lg tracking-tight font-bold ml-1 sm:ml-0">Recent Reports</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-0 p-0">
                        {loading ? (
                            <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground px-4">
                                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="font-medium">No reports yet. Start by reporting waste!</p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-0 sm:divide-y divide-border/40 mt-2 sm:mt-0">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 sm:p-5 transition-colors hover:bg-muted/30 border border-border/40 sm:border-0 rounded-2xl sm:rounded-none bg-card sm:bg-transparent shadow-sm sm:shadow-none">
                                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                            <div className="h-12 w-12 sm:h-10 sm:w-10 shrink-0 rounded-2xl sm:rounded-md bg-secondary flex items-center justify-center outline outline-1 outline-border/50 text-xl sm:text-lg shadow-sm">
                                                {task.wasteType === 'plastic' ? '🥤' : task.wasteType === 'organic' ? '🍎' : '🗑️'}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-bold tracking-tight capitalize text-foreground">{task.wasteType} Waste</p>
                                                <div className="flex flex-wrap items-center gap-2 text-[12px] sm:text-[13px] text-muted-foreground font-medium mt-0.5">
                                                    <span className="flex items-center gap-1 group">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {task.date}
                                                    </span>
                                                    <span className="hidden sm:inline-block">•</span>
                                                    <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${(task.status === 'verified') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                        (task.status === 'collected') ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                            task.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-xs sm:text-sm bg-secondary/50 px-2 py-1 sm:px-2.5 sm:py-1 rounded border border-border/50 shadow-sm shrink-0 self-start sm:self-auto mt-1 sm:mt-0">
                                            {task.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
