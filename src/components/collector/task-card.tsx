import { CollectionTask } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle, Clock, Navigation, AlertTriangle, Camera, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface TaskCardProps {
    task: CollectionTask;
    onClaim?: (taskId: string) => void;
    onVerify?: (task: CollectionTask) => void;
    onMapClick?: (taskId: string) => void;
    compact?: boolean;
}

export function TaskCard({ task, onClaim, onVerify, onMapClick, compact = false }: TaskCardProps) {
    const statusColor = {
        verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        collected: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'in-progress': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }

    const StatusIcon = {
        verified: CheckCircle,
        collected: CheckCircle,
        'in-progress': Navigation,
        rejected: AlertTriangle,
        pending: Clock
    }[task.status] || Clock

    const handleGetDirections = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering other card clicks

        // Prioritize coordinates for exact navigation, fallback to location name
        const destination = task.coordinates
            ? `${task.coordinates.lat},${task.coordinates.lng}`
            : encodeURIComponent(task.location);

        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800 h-full flex flex-col">
                {/* Map Placeholder / Header Image - Only show if NOT compact */}
                {!compact && (
                    <div className="h-32 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center" />

                        {/* Status Badge */}
                        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 shadow-sm backdrop-blur-sm ${statusColor[task.status] || statusColor.pending}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {task.status}
                        </div>

                        {/* Urgent Badge */}
                        {task.wasteType === 'hazardous' && task.status === 'pending' && (
                            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 flex items-center gap-1.5 shadow-sm animate-pulse">
                                <AlertTriangle className="h-3.5 w-3.5" /> URGENT
                            </div>
                        )}

                        {/* Location Badge */}
                        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-black/80 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-mono font-medium shadow-sm max-w-[90%] truncate flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-red-500" />
                            {task.location}
                        </div>
                    </div>
                )}

                <CardContent className={`${compact ? 'p-2' : 'p-4'} flex-1 flex flex-col justify-between ${compact ? 'gap-2' : 'gap-4'}`}>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-bold capitalize ${compact ? 'text-sm' : 'text-lg'} flex items-center gap-2`}>
                                {task.wasteType} {compact ? '' : 'Waste'}
                                {compact && (
                                    <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold capitalize ${statusColor[task.status] || statusColor.pending}`}>
                                        {task.status}
                                    </span>
                                )}
                            </h3>
                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                {task.amount}
                            </span>
                        </div>

                        {compact && (
                            <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                <span className="truncate">{task.location}</span>
                            </div>
                        )}

                        {!compact && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" /> Posted on {task.date}
                            </p>
                        )}
                    </div>

                    <div className={`pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto ${compact ? 'pt-2' : 'pt-3'}`}>
                        {task.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleGetDirections}
                                    className={`w-full ${compact ? 'h-7 text-[10px]' : 'text-xs'}`}
                                    title="Open Google Maps Directions"
                                >
                                    <ExternalLink className={`mr-2 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} /> Directions
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onClaim?.(task.id)}
                                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow ${compact ? 'h-7 text-[10px]' : 'text-xs'}`}
                                >
                                    Pickup
                                </Button>
                            </div>
                        )}

                        {(task.status === 'in-progress') && (
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleGetDirections}
                                    className={`w-full ${compact ? 'h-7 text-[10px]' : 'text-xs'}`}
                                >
                                    <Navigation className={`mr-2 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} /> Navigate
                                </Button>
                                <Button
                                    size="sm"
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow ${compact ? 'h-7 text-[10px]' : 'text-xs'}`}
                                    onClick={() => onVerify?.(task)}
                                >
                                    <Camera className={`mr-2 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} /> Verify
                                </Button>
                            </div>
                        )}

                        {(task.status === 'rejected') && (
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleGetDirections}
                                    className="w-full text-xs"
                                >
                                    <Navigation className="mr-2 h-3.5 w-3.5" /> Navigate
                                </Button>
                                <Button
                                    size="sm"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow text-xs animate-pulse"
                                    onClick={() => onVerify?.(task)}
                                >
                                    <Camera className="mr-2 h-3.5 w-3.5" /> Retry
                                </Button>
                            </div>
                        )}

                        {(task.status === 'collected' || task.status === 'verified') && (
                            <Button size="sm" variant="ghost" className="w-full cursor-default hover:bg-transparent" disabled>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Completed
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
