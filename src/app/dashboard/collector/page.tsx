"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCollectionTasks } from "@/hooks/use-collection-tasks"
import { CollectionTask } from "@/types"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { TaskCard } from "@/components/collector/task-card"
import { TaskFilters } from "@/components/collector/task-filters"
import { VerificationModal } from "@/components/collector/verification-modal"
import { CheckCircle, Clock, TrendingUp, Loader2, Search, LogOut, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { UserAvatar } from "@/components/shared/user-avatar"
import toast from "react-hot-toast"

export default function CollectorDashboard() {
    const { user, logout } = useAuth()
    const {
        tasks,
        loading,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        filteredTasks,
        stats,
        refreshTasks,
        updateTaskStatus,
        claimTask
    } = useCollectionTasks(user)

    const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null)
    const [isVerificationOpen, setIsVerificationOpen] = useState(false)

    const openVerification = (task: CollectionTask) => {
        setSelectedTask(task)
        setIsVerificationOpen(true)
    }

    const handleVerifyCollection = async (task: CollectionTask, file: File): Promise<boolean> => {
        try {
            const reader = new FileReader();
            const imageBase64 = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            // Call AI verification
            const { verifyCollection } = await import("@/lib/gemini");
            const result = await verifyCollection(task.imageUrl || "", file);

            if (result.category === 'rejected' && result.confidence > 0.7) {
                toast.error(`AI Verification Rejected: ${result.message}`);
                return false;
            }

            await updateTaskStatus(task.id, 'collected', imageBase64);
            toast.success("Collection verified and completed!");
            refreshTasks();
            return true;
        } catch (error) {
            console.error("Verification failed", error);
            return false;
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            className="space-y-8 pb-20 max-w-7xl mx-auto"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            {/* App-like Header for Mobile */}
            <div className="md:hidden flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        avatarId={user?.profileImage}
                        fallbackName={user?.name || "U"}
                        className="h-11 w-11 rounded-[1rem] shadow-sm border border-emerald-500/20"
                        iconClassName="h-5 w-5"
                    />
                    <div>
                        <p className="text-[12px] font-semibold text-muted-foreground tracking-tight uppercase">
                            Collector Hub
                        </p>
                        <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">{user?.name}</h1>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => logout()} className="text-muted-foreground bg-muted/30 rounded-full h-9 w-9">
                    <LogOut className="h-4 w-4 text-red-500" />
                </Button>
            </div>

            <div className="hidden md:flex flex-col gap-1.5 pb-2 border-b border-border/40">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Collector Hub</h1>
                <p className="text-muted-foreground text-sm font-medium">Manage your routes and verify collections.</p>
            </div>

            {/* Stats Overview */}
            <motion.div variants={itemVariants} className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6 gap-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="min-w-[85vw] sm:min-w-0 snap-center">
                    <KpiCard
                        title="Total Collections"
                        value={stats.totalCollections}
                        icon={CheckCircle}
                        description="Lifetime completed tasks"
                        className="rounded-2xl"
                    />
                </div>
                <div className="min-w-[85vw] sm:min-w-0 snap-center">
                    <KpiCard
                        title="Pending Tasks"
                        value={stats.pendingCollections}
                        icon={Clock}
                        description="Tasks waiting for action"
                        className="rounded-2xl"
                        trend={{
                            value: stats.pendingCollections * 2, // arbitrary trend for visual
                            label: stats.pendingCollections > 5 ? 'High Demand' : 'Normal Load',
                            isPositive: stats.pendingCollections < 5
                        }}
                    />
                </div>
                <div className="min-w-[85vw] sm:min-w-0 snap-center">
                    <KpiCard
                        title="Today's Verified"
                        value={stats.todayCollections}
                        icon={TrendingUp}
                        description="Collections verified today"
                        className="rounded-2xl"
                        trend={{
                            value: 12,
                            label: "vs yesterday",
                            isPositive: true
                        }}
                    />
                </div>
            </motion.div>

            {/* Filters & Search */}
            <motion.div variants={itemVariants} className="sticky top-0 md:top-0 z-40 bg-background/80 backdrop-blur-xl pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 border-b border-border/40 md:border-none pt-2">
                <TaskFilters
                    filter={filter}
                    setFilter={setFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </motion.div>

            {/* Task Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/60 bg-muted/10 rounded-xl"
                        >
                            <div className="bg-secondary p-4 rounded-full mb-4 shadow-sm">
                                <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-bold text-lg tracking-tight">No tasks found</h3>
                            <p className="text-sm font-medium text-muted-foreground mt-1 max-w-sm">Try adjusting your filters or search query to find more collections.</p>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onClaim={claimTask}
                                onVerify={openVerification}
                                onMapClick={(id) => window.location.href = `/dashboard/collector/map?taskId=${id}`}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            <VerificationModal
                task={selectedTask}
                isOpen={isVerificationOpen}
                onClose={() => setIsVerificationOpen(false)}
                onVerify={handleVerifyCollection}
            />

            {/* Mobile Floating Refresh Button */}
            <div className="md:hidden fixed bottom-24 right-4 z-40">
                <Button
                    size="icon"
                    className="rounded-full h-12 w-12 shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
                    onClick={refreshTasks}
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
        </motion.div>
    )
}
