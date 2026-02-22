"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCollectionTasks } from "@/hooks/use-collection-tasks"
import { CollectionTask } from "@/types"
import { StatsCard } from "@/components/collector/stats-card"
import { TaskCard } from "@/components/collector/task-card"
import { TaskFilters } from "@/components/collector/task-filters"
import { VerificationModal } from "@/components/collector/verification-modal"
import { CheckCircle, Clock, TrendingUp, Loader2, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

export default function CollectorDashboard() {
    const { user } = useAuth()
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
            // Convert file to base64 for API/Storage if needed, but for Gemini we use File object locally
            // In a real app we'd upload to cloud storage first.
            // Here we just use the local file for the verify call.

            const reader = new FileReader();
            const imageBase64 = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            // Call AI verification
            const { verifyCollection } = await import("@/lib/gemini");
            // Note: verifyCollection expects (imageUrl, imageFile). 
            // We are verifying the *new* image against the *original task* image? 
            // Or just analyzing the new image? The previous code passed (task.imageUrl, file).
            const result = await verifyCollection(task.imageUrl || "", file);

            if (result.category === 'rejected' && result.confidence > 0.7) {
                toast.error(`AI Verification Rejected: ${result.message}`);
                return false;
            }

            await updateTaskStatus(task.id, 'collected', imageBase64); // passing base64 as proof for now
            toast.success("Collection verified and completed!");
            refreshTasks();
            return true;
        } catch (error) {
            console.error("Verification failed", error);
            // Don't throw the error back to the UI which causes Next.js overlays
            return false;
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Collector Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your collection tasks efficiently.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Total Collections"
                    value={stats.totalCollections}
                    icon={CheckCircle}
                    description="Lifetime completed tasks"
                />
                <StatsCard
                    title="Pending Tasks"
                    value={stats.pendingCollections}
                    icon={Clock}
                    description="Tasks waiting for action"
                    trend={`${stats.pendingCollections > 5 ? 'High Demand' : 'Normal'}`}
                    trendUp={stats.pendingCollections < 5}
                />
                <StatsCard
                    title="Today's Performance"
                    value={stats.todayCollections}
                    icon={TrendingUp}
                    description="Collections verified today"
                    trend="+2 from yesterday"
                    trendUp={true}
                />
            </div>

            {/* Filters & Search */}
            <TaskFilters
                filter={filter}
                setFilter={setFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {/* Task Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl"
                        >
                            <div className="bg-gray-100 p-4 rounded-full dark:bg-gray-800 mb-3">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-lg">No tasks found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
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
        </div>
    )
}
