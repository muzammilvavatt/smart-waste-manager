"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Users, Trash2, CheckCircle, AlertTriangle, Loader2, Check, X, Filter } from "lucide-react"
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

// Dynamically import charts with no SSR to prevent hydration issues
const WeeklyCollectionChart = dynamic(() => import('@/components/admin/WeeklyCollectionChart'), { ssr: false })
const WasteCategoryChart = dynamic(() => import('@/components/admin/WasteCategoryChart'), { ssr: false })

interface DashboardStats {
    totalUsers: number;
    totalCollections: number;
    pendingTasks: number;
    activeCollectors: number;
    weeklyStats: Array<{ name: string; date: string; waste: number }>;
    wasteTypeStats: Array<{ name: string; value: number }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [verificationTasks, setVerificationTasks] = useState<CollectionTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false); // Valid refreshing state
    const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
    const [dateRange, setDateRange] = useState("7d");
    const { addNotification } = useNotifications();

    const fetchDashboardData = async (range = "7d") => {
        try {
            // Only set major loading on initial load or if explicitly needed
            // For refresh/filter, we might want to just show the spinner on the button or specific parts
            if (!stats) setLoading(true);

            const [statsRes, tasksData] = await Promise.all([
                fetch(`/api/admin/dashboard/stats?range=${range}`),
                getTasks('admin')
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            setVerificationTasks(tasksData.filter((t: CollectionTask) => t.status === 'collected'));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error("Failed to refresh data");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(dateRange);
    }, [dateRange]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchDashboardData(dateRange);
    }

    const openVerifyModal = (task: CollectionTask) => {
        setSelectedTask(task);
    };

    const handleVerifyTask = async (taskId: string, approved: boolean) => {
        try {
            setLoading(true);
            await updateTaskStatus(taskId, approved ? 'verified' : 'rejected');
            // Refresh data
            await fetchDashboardData(dateRange);
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">City Overview</h1>
                    <p className="text-muted-foreground mt-1">Real-time monitoring of waste management operations.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    description="Registered citizens"
                    trend={{ value: 12, label: "vs last month", isPositive: true }}
                />
                <KpiCard
                    title="Collections"
                    value={stats?.totalCollections || 0}
                    icon={Trash2}
                    description={dateRange === 'all' ? "All time collections" : `In the last ${dateRange === '7d' ? '7 days' : '30 days'}`}
                    trend={{ value: 8, label: "from prev period", isPositive: true }}
                />
                <KpiCard
                    title="Pending Tasks"
                    value={stats?.pendingTasks || 0}
                    icon={AlertTriangle}
                    description="Awaiting action"
                    className="border-orange-200 dark:border-orange-900/50"
                />
                <KpiCard
                    title="Active Collectors"
                    value={stats?.activeCollectors || 0}
                    icon={CheckCircle}
                    description="On duty now"
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                <Card className="lg:col-span-6 xl:col-span-6 glass-card">
                    <CardHeader>
                        <CardTitle>Weekly Collection Trends</CardTitle>
                        <CardDescription>Daily waste collection volume over the last {dateRange === '30d' ? '30' : '7'} days.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 h-[350px]">
                        <WeeklyCollectionChart data={stats?.weeklyStats || []} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-6 xl:col-span-6 glass-card">
                    <CardHeader>
                        <CardTitle>Waste Composition</CardTitle>
                        <CardDescription>Distribution by waste category.</CardDescription>
                    </CardHeader>
                    <CardContent className="w-full p-4">
                        <div className="h-[350px] w-full">
                            <WasteCategoryChart data={stats?.wasteTypeStats || []} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Verification Section */}
            <div className="grid gap-6">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Verification Queue</CardTitle>
                            <CardDescription>Tasks requiring admin approval ({verificationTasks.length} pending)</CardDescription>
                        </div>
                        {/* Optional Search/Filter inside card */}
                    </CardHeader>
                    <CardContent className="p-0">
                        {verificationTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 text-emerald-500/20 mb-4" />
                                <p>All items verified. Good job!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {verificationTasks.map(task => (
                                    <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 transition-colors hover:bg-muted/30 gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold capitalize text-foreground flex items-center gap-2">
                                                    {task.wasteType} Waste
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium border border-border/50">
                                                    {task.amount}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                                                {task.location}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 pt-1">
                                                <span>By:</span>
                                                <div className="flex items-center gap-1.5 font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                                                    {task.collectorId || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                            {task.imageUrl && (
                                                <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20 font-medium">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Proof Attached
                                                </div>
                                            )}
                                            <Button
                                                size="sm"
                                                onClick={() => openVerifyModal(task)}
                                                className="w-full sm:w-auto shadow-sm"
                                            >
                                                Review
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Verification Modal */}
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
        </div>
    )
}
