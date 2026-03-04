"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Users, Trash2, CheckCircle, AlertTriangle, Loader2, Check, X, Filter, LogOut, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import dynamic from 'next/dynamic'
import { getTasks, updateTaskStatus } from "@/lib/store"
import { CollectionTask } from "@/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCcw } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import useSWR from 'swr'
import { UserAvatar } from "@/components/shared/user-avatar"
import { useAuth } from "@/contexts/auth-context"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { SwipeableCard } from "@/components/ui/swipeable-card"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/dashboard/page-header"

// Dynamically import charts with no SSR to prevent hydration issues
const WeeklyCollectionChart = dynamic(() => import('@/components/admin/WeeklyCollectionChart'), { ssr: false })
const WasteCategoryChart = dynamic(() => import('@/components/admin/WasteCategoryChart'), { ssr: false })
const DashboardHeatmap = dynamic(() => import('@/components/admin/dashboard-heatmap'), { ssr: false })

interface DashboardStats {
    totalUsers: number;
    totalCollections: number;
    pendingTasks: number;
    activeCollectors: number;
    weeklyStats: Array<{ name: string; date: string; waste: number }>;
    wasteTypeStats: Array<{ name: string; value: number }>;
}

export default function AdminDashboard() {
    const { user, logout } = useAuth()
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
    const [dateRange, setDateRange] = useState("7d");
    const [isDesktop, setIsDesktop] = useState(true);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const { addNotification } = useNotifications();

    useEffect(() => {
        const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkIsDesktop();
        window.addEventListener('resize', checkIsDesktop);
        return () => window.removeEventListener('resize', checkIsDesktop);
    }, []);

    const fetcher = async ([key, range]: [string, string]) => {
        const [statsRes, tasksData] = await Promise.all([
            fetch(`/api/admin/dashboard/stats?range=${range}`).then(res => res.json()),
            getTasks('admin')
        ]);
        return {
            stats: statsRes as DashboardStats,
            tasks: tasksData.filter((t: CollectionTask) => t.status === 'collected'),
            allTasks: tasksData
        };
    };

    const { data, error, isLoading: loading, mutate } = useSWR(
        ['admin-dashboard', dateRange],
        fetcher,
        { revalidateOnFocus: false }
    );

    const stats = data?.stats || null;
    const verificationTasks = data?.tasks || [];
    const allTasks = data?.allTasks || [];

    // Fetch AI summary on demand
    const fetchAiInsight = async () => {
        if (!stats) return;
        setIsGeneratingAi(true);
        try {
            const res = await fetch('/api/admin/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stats })
            });
            const data = await res.json();
            if (data.summary) {
                setAiSummary(data.summary);
            }
        } catch (error) {
            console.error("Failed to fetch AI summary", error);
            toast.error("Failed to generate insights");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await mutate();
        setIsRefreshing(false);
    }

    const openVerifyModal = (task: CollectionTask) => {
        setSelectedTask(task);
    };

    const handleVerifyTask = async (taskId: string, approved: boolean) => {
        try {
            // Optimistically update the UI
            const updatedTasks = verificationTasks.filter(t => t.id !== taskId);
            mutate({ stats: stats as DashboardStats, tasks: updatedTasks, allTasks: allTasks }, false);

            await updateTaskStatus(taskId, approved ? 'verified' : 'rejected');
            // Refresh data from server
            await mutate();

            toast.success(approved ? "Task verified successfully" : "Task rejected");
            if (approved) {
                addNotification("success", "Task Approved", "Task has been marked as verified successfully.");
            } else {
                addNotification("warning", "Task Rejected", "Task was rejected by admin.");
            }
        } catch (error) {
            console.error("Verification failed", error);
            toast.error("Verification failed");
        }
    };

    // ... verify handlers

    if (loading && !stats) {
        // ... existing loading skeleton
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // ... error state

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            <PageHeader
                title="City Overview"
                description="Real-time monitoring of waste management operations."
                user={user}
                onLogout={logout}
                roleLabel="Administrator"
                actions={
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card border-border/50 text-sm font-medium">
                                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-10 px-4 shadow-sm" variant="outline">
                            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <RefreshCcw className="h-4 w-4 sm:mr-2" />}
                            <span className="hidden sm:inline">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
                        </Button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="w-full">
                    <KpiCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={Users}
                        description="Registered citizens"
                        className="rounded-2xl bg-card/60 backdrop-blur-xl border-border/40 hover:bg-card/80 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10"
                        trend={{ value: 12, label: "vs last month", isPositive: true }}
                    />
                </div>
                <div className="w-full">
                    <KpiCard
                        title="Collections"
                        value={stats?.totalCollections || 0}
                        icon={Trash2}
                        description={dateRange === 'all' ? "All time collections" : `In the last ${dateRange === '7d' ? '7 days' : '30 days'}`}
                        className="rounded-2xl bg-card/60 backdrop-blur-xl border-border/40 hover:bg-card/80 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10"
                        trend={{ value: 8, label: "from prev period", isPositive: true }}
                    />
                </div>
                <div className="w-full">
                    <KpiCard
                        title="Pending Tasks"
                        value={stats?.pendingTasks || 0}
                        icon={AlertTriangle}
                        description="Awaiting action"
                        className="border-orange-200/50 dark:border-orange-900/30 rounded-2xl bg-card/60 backdrop-blur-xl hover:bg-card/80 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10"
                    />
                </div>
                <div className="w-full">
                    <KpiCard
                        title="Active Collectors"
                        value={stats?.activeCollectors || 0}
                        icon={CheckCircle}
                        description="On duty now"
                        className="rounded-2xl bg-card/60 backdrop-blur-xl border-border/40 hover:bg-card/80 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10"
                    />
                </div>
            </div>

            {/* AI Insights Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <div className="relative overflow-hidden rounded-2xl border border-blue-200/30 dark:border-blue-900/20 bg-card/60 backdrop-blur-xl p-6 shadow-sm hover:shadow-md hover:shadow-blue-500/5 transition-all">
                    {/* Decorative background elements */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 border-l border-blue-500/10 right-20 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                            {isGeneratingAi ? (
                                <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                            ) : (
                                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 tracking-tight">
                                    AI City Insights
                                </h3>
                                <Button
                                    size="sm"
                                    onClick={fetchAiInsight}
                                    disabled={isGeneratingAi || !stats}
                                    className="w-full sm:w-auto overflow-hidden relative group h-9 px-4 font-bold tracking-wide text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all duration-300 rounded-lg"
                                >
                                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-in-out -translate-x-full skew-x-12" />
                                    <Sparkles className="w-4 h-4 mr-2 inline-block animate-pulse" />
                                    {isGeneratingAi ? (
                                        <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Generating...</>
                                    ) : (
                                        "Generate Insights"
                                    )}
                                </Button>
                            </div>
                            <div className="min-h-[48px] flex items-center">
                                {isGeneratingAi ? (
                                    <div className="space-y-2 w-full max-w-2xl mt-1">
                                        <div className="h-4 bg-blue-200/50 dark:bg-blue-800/30 rounded animate-pulse w-full" />
                                        <div className="h-4 bg-blue-200/50 dark:bg-blue-800/30 rounded animate-pulse w-4/5" />
                                    </div>
                                ) : (
                                    <p className="text-[15px] font-medium leading-relaxed text-blue-800/90 dark:text-blue-200/80 max-w-4xl mt-1">
                                        {aiSummary ? aiSummary : "Click 'Generate Insights' to analyze current city dashboard statistics using AI."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Charts Section */}

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 mb-6">
                <Card className="lg:col-span-8 xl:col-span-8 bg-card/60 backdrop-blur-xl border-border/40 hover:shadow-md transition-all h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Weekly Collection Trends</CardTitle>
                        <CardDescription>
                            {dateRange === 'all'
                                ? 'Daily waste collection volume for all time.'
                                : `Daily waste collection volume over the last ${dateRange === '30d' ? '30' : '7'} days.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 pr-4 pb-4 flex-1 h-[350px]">
                        <div className="w-full h-full flex items-center justify-center">
                            <WeeklyCollectionChart data={stats?.weeklyStats || []} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-4 xl:col-span-4 bg-card/60 backdrop-blur-xl border-border/40 hover:shadow-md transition-all h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Waste Composition</CardTitle>
                        <CardDescription>Distribution by waste category.</CardDescription>
                    </CardHeader>
                    <CardContent className="w-full p-4 flex-1 h-[350px]">
                        <div className="w-full h-full flex items-center justify-center">
                            <WasteCategoryChart data={stats?.wasteTypeStats || []} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Verification & Heatmap Section */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-8 xl:col-span-8 w-full h-full">
                    <Card className="shadow-sm border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/10 pb-4">
                            <div>
                                <CardTitle className="text-lg">Verification Queue</CardTitle>
                                <CardDescription>Tasks requiring admin approval ({verificationTasks.length} pending)</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {verificationTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                    <CheckCircle className="h-12 w-12 text-emerald-500/20 mb-4" />
                                    <p className="font-medium">All items verified. Good job!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {verificationTasks.map(task => {
                                        // High-density mobile list format combined with desktop card format
                                        const taskCardContentMobile = (
                                            <div className="bg-background dark:bg-zinc-900/40 relative overflow-hidden group active:bg-muted/30 transition-colors">
                                                {/* Status Indicator Bar */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 bg-opacity-100" />

                                                <div className="p-3.5 pl-5 flex items-center justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold capitalize text-[15px] tracking-tight truncate text-foreground">
                                                                {task.wasteType}
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium truncate pr-2">
                                                            <CheckCircle className="h-3 w-3 text-emerald-500/80 shrink-0" />
                                                            <span className="truncate">Ready to verify &middot; {task.collectorId || 'Unknown'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                        <span className="text-[11px] font-bold bg-secondary/80 px-2 py-0.5 rounded shadow-sm text-foreground">
                                                            {task.amount}
                                                        </span>
                                                        {task.imageUrl && (
                                                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                                                Proof
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );

                                        const taskCardContentDesktop = (
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 transition-colors hover:bg-muted/30 gap-4 group">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold tracking-tight capitalize text-foreground flex items-center gap-2">
                                                            {task.wasteType} Waste
                                                        </span>
                                                        <span className="text-xs px-2.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground font-semibold">
                                                            {task.amount}
                                                        </span>
                                                        {task.isSuspicious && (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">
                                                                ⚠️ Suspicious
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                                        {task.location}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground/80 font-medium pt-1">
                                                        <span className="shrink-0">Collected by:</span>
                                                        <div className="text-foreground truncate max-w-[150px] sm:max-w-none">
                                                            {task.collectorId || 'Unknown'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                                    {task.imageUrl && (
                                                        <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-200 dark:border-blue-500/20 font-semibold">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Proof Attached
                                                        </div>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openVerifyModal(task)}
                                                        className="w-full sm:w-auto font-semibold tracking-tight shadow-sm opacity-90 group-hover:opacity-100 transition-opacity flex"
                                                    >
                                                        Review
                                                    </Button>
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <div key={task.id}>
                                                <div className="md:hidden">
                                                    <SwipeableCard
                                                        leftAction={{
                                                            icon: <Check className="w-6 h-6" />,
                                                            label: "Approve",
                                                            color: "#10b981", // emerald-500
                                                            onAction: () => handleVerifyTask(task.id, true)
                                                        }}
                                                        rightAction={{
                                                            icon: <X className="w-6 h-6" />,
                                                            label: "Reject",
                                                            color: "#ef4444", // red-500
                                                            onAction: () => handleVerifyTask(task.id, false)
                                                        }}
                                                    >
                                                        <div onClick={() => openVerifyModal(task)}>
                                                            {taskCardContentMobile}
                                                        </div>
                                                    </SwipeableCard>
                                                </div>
                                                <div className="hidden md:block">
                                                    {taskCardContentDesktop}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-4 xl:col-span-4 w-full h-full">
                    <Card className="bg-card/60 backdrop-blur-xl border-border/40 hover:shadow-md transition-all h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Collection Heatmap</CardTitle>
                            <CardDescription>Task density heat map.</CardDescription>
                        </CardHeader>
                        <CardContent className="w-full p-4 pt-0 min-h-[400px] flex-1">
                            <DashboardHeatmap tasks={allTasks} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Verification Modal / Bottom Sheet */}
            {isDesktop ? (
                <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                    <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/20">
                        <DialogHeader className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 -mt-2 -mr-2 h-8 w-8 rounded-full hover:bg-muted"
                                onClick={() => setSelectedTask(null)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                            <DialogTitle>Verify Collection Task</DialogTitle>
                            <DialogDescription>
                                Review the proof of work submitted by the collector.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedTask && (
                            <div className="space-y-4 py-4">
                                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold capitalize text-foreground">{selectedTask.wasteType} Waste</span>
                                        <span className="text-sm px-2 py-1 bg-background rounded-md shadow-sm">{selectedTask.amount}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{selectedTask.location}</p>
                                </div>

                                {selectedTask.proofImage ? (
                                    <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm group relative">
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                        <img
                                            src={selectedTask.proofImage}
                                            alt="Proof of work"
                                            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-40 bg-muted/30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted text-muted-foreground gap-2">
                                        <AlertTriangle className="h-8 w-8 opacity-50" />
                                        <span>No proof image available</span>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 text-sm p-3 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300">
                                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <p>Ensure the image clearly shows the collected waste at the specified location.</p>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-3 sm:gap-0 mt-4 flex-col-reverse sm:flex-row">
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (selectedTask) {
                                        handleVerifyTask(selectedTask.id, false);
                                        setSelectedTask(null);
                                    }
                                }}
                                disabled={loading}
                                className="w-full sm:w-auto sm:mr-2"
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={() => {
                                    if (selectedTask) {
                                        handleVerifyTask(selectedTask.id, true);
                                        setSelectedTask(null);
                                    }
                                }}
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto mb-2 sm:mb-0 shadow-md"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-1" />}
                                Approve Task
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : (
                <BottomSheet isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Verify Collection">
                    {selectedTask && (
                        <div className="space-y-4 pt-4 pb-0 flex flex-col h-full">
                            <div className="bg-muted/50 p-4 rounded-xl border border-border/50 shrink-0">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold capitalize text-foreground">{selectedTask.wasteType} Waste</span>
                                    <span className="text-sm px-2 py-1 bg-background rounded-md shadow-sm">{selectedTask.amount}</span>
                                </div>
                                <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-1.5 leading-snug">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                    {selectedTask.location}
                                </p>
                            </div>

                            {selectedTask.proofImage ? (
                                <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm relative shrink-0">
                                    <img
                                        src={selectedTask.proofImage}
                                        alt="Proof of work"
                                        className="w-full h-[25vh] object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-[20vh] bg-muted/30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted text-muted-foreground gap-2 shrink-0">
                                    <AlertTriangle className="h-8 w-8 opacity-50" />
                                    <span>No proof image available</span>
                                </div>
                            )}

                            <div className="mt-auto pt-6 pb-6 flex gap-3 shrink-0">
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (selectedTask) {
                                            handleVerifyTask(selectedTask.id, false);
                                            setSelectedTask(null);
                                        }
                                    }}
                                    disabled={loading}
                                    className="flex-1 font-semibold"
                                >
                                    <X className="mr-1.5 h-4 w-4" /> Reject
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (selectedTask) {
                                            handleVerifyTask(selectedTask.id, true);
                                            setSelectedTask(null);
                                        }
                                    }}
                                    disabled={loading}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
                                    Approve
                                </Button>
                            </div>
                        </div>
                    )}
                </BottomSheet>
            )}
        </div>
    )
}
