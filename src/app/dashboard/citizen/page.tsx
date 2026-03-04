
























































































































































































































"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getTasks } from "@/lib/store"
import { CollectionTask } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Leaf, MapPin, Calendar, Clock, Loader2, Trophy, Plus, FileText, LogOut, Package, Recycle, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { UserAvatar } from "@/components/shared/user-avatar"
import { PageHeader } from "@/components/dashboard/page-header"

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
            <PageHeader
                title={
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent drop-shadow-sm">
                        Welcome back, {user?.name?.split(' ')[0] || "Citizen"}
                    </span>
                }
                description="Here's an overview of your eco-impact."
                user={user}
                onLogout={logout}
                roleLabel="Citizen"
                mobileActions={
                    <Link href="/dashboard/citizen/rewards">
                        <div className="flex items-center gap-2 bg-card p-1.5 pr-4 rounded-full border shadow-sm transition-transform active:scale-95">
                            <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                                <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <span className="font-bold text-sm tracking-tight">{user?.points || 0} <span className="text-muted-foreground hidden sm:inline">pts</span></span>
                        </div>
                    </Link>
                }
                actions={
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Link href="/dashboard/citizen/upload" className="w-full sm:w-auto">
                            <Button className="w-full gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] bg-emerald-600 hover:bg-emerald-700 font-semibold h-11 sm:h-10 text-white">
                                <Plus className="h-4 w-4" /> Report Waste
                            </Button>
                        </Link>
                        <Link href="/dashboard/citizen/rewards/leaderboard" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full gap-2 shadow-sm font-semibold h-11 sm:h-10 bg-card">
                                <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* Prominent Action Card (Mobile Only) */}
            <motion.div variants={item} className="md:hidden">
                <Link href="/dashboard/citizen/upload" className="block w-full outline-none tap-highlight-transparent group">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 p-6 sm:p-8 text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-[0.98] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.7)] group-hover:-translate-y-1">
                        {/* Animated gradient mesh background */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/20 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-48 w-48 rounded-full bg-black/20 blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner border border-white/30 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                                    <Plus className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-md" />
                                </div>
                                <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <ArrowUpRight className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">Report Waste</h2>
                                <p className="text-emerald-50/90 text-sm sm:text-base mt-2 font-medium max-w-[260px] leading-relaxed drop-shadow-sm">
                                    Snap a photo and earn points for keeping our city clean.
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Stats Scroll (Mobile Horizontal, Desktop Grid) */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="w-full group">
                    <KpiCard
                        title="Total Points"
                        value={user?.points || 0}
                        icon={Leaf}
                        description="From approved reports"
                        className="rounded-[1.5rem] bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)]"
                    />
                </div>
                <div className="w-full group">
                    <KpiCard
                        title="Lifetime Reports"
                        value={tasks.length}
                        icon={MapPin}
                        description="Contributions to the city"
                        className="rounded-[1.5rem] bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)]"
                    />
                </div>
                <div className="w-full group">
                    <KpiCard
                        title="Pending Pickups"
                        value={pendingTasks}
                        icon={Clock}
                        description="Awaiting collection"
                        className="border-orange-200/50 dark:border-orange-900/30 rounded-[1.5rem] bg-card/60 backdrop-blur-xl hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(249,115,22,0.12)]"
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
                <Card className="rounded-[1.5rem] border-none sm:border-solid border-border/40 shadow-none sm:shadow-sm overflow-hidden bg-card/60 backdrop-blur-xl hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between px-2 sm:px-6 p-0 sm:p-6 sm:border-b border-border/40 pb-4">
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
                            <div className="space-y-4 sm:space-y-3 mt-2 sm:mt-0 p-2 sm:p-4">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 transition-all duration-300 hover:-translate-y-1 border border-white/10 dark:border-white/5 rounded-2xl bg-card/80 backdrop-blur-md shadow-sm hover:shadow-md hover:border-emerald-500/20 group">
                                        <div className="flex items-start sm:items-center gap-4">
                                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/30 text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                                                {task.wasteType === 'plastic' ? <Recycle className="h-6 w-6 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" /> : task.wasteType === 'organic' ? <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" /> : <Trash2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-bold text-lg tracking-tight capitalize text-foreground">{task.wasteType} Waste</p>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {task.date}
                                                    </span>
                                                    <span className="hidden sm:inline-block opacity-50">•</span>
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors ${(task.status === 'verified') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/50' :
                                                        (task.status === 'collected') ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300 border border-blue-200 dark:border-blue-500/50' :
                                                            task.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/30 dark:text-red-300 border border-red-200 dark:border-red-500/50' :
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/50'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-black text-sm bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 shadow-sm shrink-0 self-start sm:self-auto mt-3 sm:mt-0 text-foreground group-hover:border-emerald-500/30 transition-colors">
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
