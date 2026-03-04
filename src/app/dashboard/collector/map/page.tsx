"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, Suspense, useMemo } from "react"
import { motion, useDragControls, AnimatePresence } from "framer-motion"
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
    const [userLocation, setUserLocation] = useState<[number, number] | null>(() => {
        // Try to load cached location to prevent loading screen when navigating back
        if (typeof window !== 'undefined') {
            const cached = sessionStorage.getItem('collector-location')
            if (cached) return JSON.parse(cached)
        }
        return null
    })
    const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied'>(() => {
        if (typeof window !== 'undefined' && sessionStorage.getItem('collector-location')) {
            return 'granted'
        }
        return 'loading'
    })
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
                    const loc = [position.coords.latitude, position.coords.longitude] as [number, number];
                    setUserLocation(loc)
                    setLocationStatus('granted')
                    sessionStorage.setItem('collector-location', JSON.stringify(loc))
                },
                (error) => {
                    console.log("Geolocation error:", error)
                    setUserLocation(null)
                    setLocationStatus('denied')
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            )
        } else {
            setUserLocation(null)
            setLocationStatus('denied')
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

    const [isMinimized, setIsMinimized] = useState(false)

    if (locationStatus === 'loading') {
        return (
            <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px] w-full items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border border-border/40 p-6 relative">
                {/* Back Button for mobile context */}
                <div className="absolute top-4 left-4 z-[1001] md:hidden">
                    <Button variant="secondary" size="icon" onClick={() => router.back()} className="rounded-full shadow-lg">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </div>

                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Getting your location...</h3>
                <p className="text-gray-500 text-sm text-center max-w-sm font-medium">
                    We need your location to show nearby active collections and calculate optimal routes.
                </p>
            </div>
        )
    }

    if (locationStatus === 'denied') {
        return (
            <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px] w-full items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-border/40 p-6 relative">
                {/* Back Button for mobile context */}
                <div className="absolute top-4 left-4 z-[1001] md:hidden">
                    <Button variant="secondary" size="icon" onClick={() => router.back()} className="rounded-full shadow-lg border border-gray-200">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </div>

                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 tracking-tight text-center">Location Access Required</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6 text-sm font-medium leading-relaxed">
                    You must enable location services in your browser's site settings to view the Collector Map. We use this to calculate distances to nearby tasks correctly.
                </p>
                <div className="flex gap-3 w-full max-w-xs">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1 border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 shadow-sm font-bold active:scale-95 transition-all"
                    >
                        Go Back
                    </Button>
                    <Button
                        onClick={() => {
                            setLocationStatus('loading')
                            window.location.reload()
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md active:scale-95 transition-all"
                    >
                        I enabled it
                    </Button>
                </div>
            </div>
        )
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
                userLocation={userLocation}
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
            <AnimatePresence mode="wait">
                {isMinimized ? (
                    <motion.div
                        key="minimized"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1, ease: "easeInOut" }}
                        className="absolute top-4 right-4 z-[1000] hidden md:block"
                    >
                        <Button
                            onClick={() => setIsMinimized(false)}
                            className="bg-white text-gray-900 border border-gray-200 shadow-xl hover:bg-gray-50 flex items-center gap-2 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 px-4 h-12 rounded-lg font-bold transition-all duration-200 hover:bg-gray-100 active:scale-95"
                        >
                            <Filter className="h-4 w-4" />
                            Show Collections ({processedTasks.length})
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="expanded"
                        drag
                        dragListener={false}
                        dragControls={dragControls}
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1, ease: "easeInOut" }}
                        className="absolute top-4 right-4 w-80 bg-card/80 backdrop-blur-2xl p-4 rounded-xl shadow-xl z-[1000] max-h-[60vh] flex flex-col border border-border/40 hidden md:flex"
                    >
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex items-center justify-between mb-4 cursor-move touch-none select-none"
                            title="Drag to move"
                        >
                            <div className="flex items-center gap-3 w-full">
                                <h3 className="font-bold flex items-center gap-2 flex-1">
                                    <span className="w-8 h-1 bg-gray-300 rounded-full mx-auto md:hidden block"></span>
                                    Active Collections
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMinimized(true);
                                    }}
                                    className="p-1.5 -mr-1.5 rounded-md transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 hover:scale-110 active:scale-95 flex items-center justify-center bg-gray-100 dark:bg-gray-800/50"
                                    title="Minimize panel"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNearby(!showNearby);
                                }}
                                className={`p-2 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium w-full justify-center ${showNearby ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
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
                )}
            </AnimatePresence>

            <VerificationModal
                task={selectedTask}
                isOpen={isVerificationOpen}
                onClose={() => setIsVerificationOpen(false)}
                onVerify={handleVerifyCollection}
            />
        </div>
    )
}
