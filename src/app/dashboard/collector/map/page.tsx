"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, Suspense, useMemo } from "react"
import { motion, useDragControls } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useSearchParams, useRouter } from "next/navigation"
import { CollectionTask } from "@/types"
import { Loader2, MapPin, Filter, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { DEFAULT_MAP_CENTER } from "@/lib/constants"
import { useCollectionTasks } from "@/hooks/use-collection-tasks"
import { VerificationModal } from "@/components/collector/verification-modal"
import { TaskCard } from "@/components/collector/task-card"
import { Button } from "@/components/ui/button"

// Dynamically import MapView with no SSR
const MapView = dynamic(() => import("@/components/shared/map-view"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100"><Loader2 className="h-8 w-8 animate-spin" /></div>
})

// Helper for distance calculation
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function CollectorMapPage() {
    return (
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-gray-100"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CollectorMapContent />
        </Suspense>
    )
}

function CollectorMapContent() {
    const { user } = useAuth()
    const {
        tasks,
        loading,
        claimTask,
        updateTaskStatus,
        refreshTasks
    } = useCollectionTasks(user, 'all') // Fetch ALL tasks for the map

    const [showNearby, setShowNearby] = useState(false)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()

    const focusedTaskId = searchParams.get('taskId')
    const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null)
    const [isVerificationOpen, setIsVerificationOpen] = useState(false)
    const dragControls = useDragControls()

    useEffect(() => {
        // Get user location with live updates
        let watchId: number;
        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude])
                },
                (error) => {
                    console.log("Geolocation error:", error)
                    setUserLocation(prev => prev || DEFAULT_MAP_CENTER)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            )
        } else {
            setUserLocation(DEFAULT_MAP_CENTER)
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [])

    // Filter and Sort tasks
    const processedTasks = useMemo(() => {
        // Filter out completed tasks from the map view to reduce clutter, 
        // unless we specifically want to see them (future feature)
        // For now, only show pending/in-progress/rejected
        const activeTasks = tasks.filter(t => t.status !== 'collected' && t.status !== 'verified');

        if (!userLocation) return activeTasks;

        // Attach distance to tasks for sorting/display
        const tasksWithDistance = activeTasks.map(task => {
            if (!task.coordinates) return { ...task, distance: Infinity };
            const dist = getDistance(userLocation[0], userLocation[1], task.coordinates.lat, task.coordinates.lng);
            return { ...task, distance: dist };
        });

        if (showNearby) {
            return tasksWithDistance
                .filter(t => t.distance < 5) // Filter: < 5km
                .sort((a, b) => a.distance - b.distance); // Sort: Closest first
        }

        return tasksWithDistance;
    }, [tasks, showNearby, userLocation]);

    const handleVerifyCollection = async (task: CollectionTask, file: File) => {
        try {
            const reader = new FileReader();
            const imageBase64 = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            // Note: Map view was skipping AI verification. 
            // We can now enable it or keep it simple. 
            // Let's enable it for consistency, but if network is poor in field, maybe optional?
            // For now, we reuse the same logic as Dashboard.

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

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px] w-full relative rounded-xl overflow-hidden border bg-gray-100 dark:bg-gray-800">
            {/* Back Button for mobile/embedded context */}
            <div className="absolute top-4 left-4 z-[1001] md:hidden">
                <Button variant="secondary" size="icon" onClick={() => router.back()} className="rounded-full shadow-lg">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </div>

            <MapView
                tasks={processedTasks}
                focusedTaskId={focusedTaskId}
                onClaimTask={claimTask}
                onCompleteTask={(taskId) => {
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        setSelectedTask(task);
                        setIsVerificationOpen(true);
                    }
                }}
            />

            {/* Overlay for tasks list */}
            <motion.div
                drag
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl dark:bg-gray-900/95 z-[1000] max-h-[60vh] flex flex-col border border-gray-200 dark:border-gray-700 hidden md:flex"
            >
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="flex items-center justify-between mb-4 cursor-move touch-none select-none"
                    title="Drag to move"
                >
                    <h3 className="font-bold flex items-center gap-2">
                        <span className="w-8 h-1 bg-gray-300 rounded-full mx-auto md:hidden block"></span>
                        Active Collections
                    </h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNearby(!showNearby);
                        }}
                        className={`p-2 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium ${showNearby ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        {showNearby ? 'Showing Nearby' : 'All Tasks'}
                    </button>
                </div>

                <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading tasks...
                        </div>
                    ) : processedTasks.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500 font-medium">{showNearby ? 'No tasks within 5km' : 'No active tasks found'}</p>
                            {showNearby && <button onClick={() => setShowNearby(false)} className="text-xs text-blue-600 mt-2 font-bold hover:underline">Clear Filter</button>}
                        </div>
                    ) : (
                        processedTasks.map(task => (
                            <div key={task.id} className="mb-3">
                                <TaskCard
                                    task={task}
                                    onClaim={claimTask}
                                    onVerify={(task) => {
                                        setSelectedTask(task);
                                        setIsVerificationOpen(true);
                                    }}
                                    onMapClick={(taskId) => {
                                        router.push(`/dashboard/collector/map?taskId=${taskId}`);
                                    }}
                                    compact={true}
                                />
                            </div>
                        ))
                    )}
                </div>
            </motion.div>

            <VerificationModal
                task={selectedTask}
                isOpen={isVerificationOpen}
                onClose={() => setIsVerificationOpen(false)}
                onVerify={handleVerifyCollection}
            />
        </div >
    )
}
