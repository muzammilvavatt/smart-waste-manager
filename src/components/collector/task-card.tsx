import { CollectionTask } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle, Clock, Navigation, AlertTriangle, Camera, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { SwipeableCard } from "@/components/ui/swipeable-card"
interface TaskCardProps {
    task: CollectionTask & { distance?: number };
    onClaim?: (taskId: string) => void;
    onVerify?: (task: CollectionTask) => void;
    onMapClick?: (taskId: string) => void;
    compact?: boolean;
}

export function TaskCard({ task, onClaim, onVerify, onMapClick, compact = false }: TaskCardProps) {
    const statusColor = {
        verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        collected: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        'in-progress': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
    }

    const StatusIcon = {
        verified: CheckCircle,
        collected: CheckCircle,
        'in-progress': Navigation,
        rejected: AlertTriangle,
        pending: Clock
    }[task.status] || Clock

    const handleGetDirections = (e: React.MouseEvent) => {
        e.stopPropagation();

        const destination = task.coordinates
            ? `${task.coordinates.lat},${task.coordinates.lng}`
            : encodeURIComponent(task.location);

        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            {/* Mobile swipeable view wrapper */}
            <div className="md:hidden">
                <SwipeableCard
                    leftAction={
                        task.status === 'pending'
                            ? {
                                icon: <CheckCircle className="w-6 h-6" />,
                                label: "Claim",
                                color: "#10b981", // emerald-500
                                onAction: () => onClaim?.(task.id)
                            }
                            : undefined
                    }
                    rightAction={
                        task.status === 'in-progress' || task.status === 'rejected'
                            ? {
                                icon: <Camera className="w-6 h-6" />,
                                label: "Verify",
                                color: "#3b82f6", // blue-500
                                onAction: () => onVerify?.(task)
                            }
                            : undefined
                    }
                >
                    <div className="bg-background dark:bg-zinc-900/40 border-b border-border/40 sm:border sm:rounded-xl relative overflow-hidden group active:bg-muted/30 transition-colors">
                        {/* Status Indicator Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColor[task.status] || statusColor.pending} bg-opacity-100`} />

                        <div className="p-3.5 pl-5 flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold capitalize text-[15px] tracking-tight truncate text-foreground">
                                        {task.wasteType}
                                    </h3>
                                    {task.wasteType === 'hazardous' && task.status === 'pending' && (
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium truncate pr-2">
                                    <MapPin className="h-3 w-3 text-red-500/80 shrink-0" />
                                    <span className="truncate">{task.location}</span>
                                    {task.distance !== undefined && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                                            <span className="truncate font-semibold text-blue-600 dark:text-blue-400">
                                                {task.distance < 1 ? '< 1 km' : `${task.distance.toFixed(1)} km`}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className="text-[11px] font-bold bg-secondary/80 px-2 py-0.5 rounded shadow-sm text-foreground">
                                    {task.amount}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${statusColor[task.status] || statusColor.pending}`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>

                        {/* Quick Actions Bar (Bottom of list item) */}
                        {task.status !== 'collected' && task.status !== 'verified' && (
                            <div className="bg-muted/20 border-t border-border/20 px-3 py-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                                <button onClick={handleGetDirections} className="flex items-center gap-1.5 hover:text-foreground active:text-foreground transition-colors py-1 px-2 -ml-2 rounded-md active:bg-muted/50">
                                    <Navigation className="h-3 w-3 text-blue-500" /> View Map
                                </button>

                                <span className="flex items-center gap-1.5 opacity-70">
                                    <Clock className="h-3 w-3" /> {task.date.split(',')[0]}
                                </span>
                            </div>
                        )}
                    </div>
                </SwipeableCard>
            </div>

            {/* Desktop original view */}
            <div className="hidden md:block h-full">
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/40 h-full flex flex-col bg-card/60 backdrop-blur-xl dark:bg-zinc-900/40 hover:-translate-y-1">
                    {!compact && (
                        <div className="h-28 bg-muted relative overflow-hidden border-b border-border/40">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center mix-blend-luminosity filter dark:invert" />

                            {/* Status Badge */}
                            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm ${statusColor[task.status] || statusColor.pending}`}>
                                <StatusIcon className="h-3 w-3" />
                                {task.status}
                            </div>

                            {/* Urgent Badge */}
                            {task.wasteType === 'hazardous' && task.status === 'pending' && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 flex items-center gap-1 shadow-sm animate-pulse">
                                    <AlertTriangle className="h-3 w-3" /> Urgent
                                </div>
                            )}

                            {/* Location Badge */}
                            <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-semibold tracking-tight shadow-sm max-w-[90%] truncate flex items-center gap-1 border border-border/50">
                                <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                                {task.location}
                            </div>
                        </div>
                    )}

                    <CardContent className={`${compact ? 'p-3' : 'p-5'} flex-1 flex flex-col justify-between ${compact ? 'gap-3' : 'gap-4'}`}>
                        <div>
                            <div className="flex justify-between items-start mb-1.5">
                                <h3 className={`font-bold capitalize ${compact ? 'text-sm' : 'text-base tracking-tight'} flex items-center gap-2`}>
                                    {task.wasteType} {compact ? '' : 'Waste'}
                                    {compact && (
                                        <span className={`ml-auto px-1.5 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-bold ${statusColor[task.status] || statusColor.pending}`}>
                                            {task.status}
                                        </span>
                                    )}
                                </h3>
                                <span className="text-xs font-bold bg-secondary/80 px-2 py-0.5 rounded border border-border/40 text-foreground shadow-sm">
                                    {task.amount}
                                </span>
                            </div>

                            {compact && (
                                <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium truncate">
                                    <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                                    <span className="truncate">{task.location}</span>
                                    {task.distance !== undefined && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                                            <span className="truncate font-semibold text-blue-600 dark:text-blue-400">
                                                {task.distance < 1 ? '< 1 km' : `${task.distance.toFixed(1)} km`}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}

                            {!compact && (
                                <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 uppercase tracking-wider">
                                    <Clock className="h-3 w-3" /> {task.date}
                                </p>
                            )}
                        </div>

                        <div className={`pt-4 mt-auto ${compact ? 'pt-3' : 'pt-4'}`}>
                            {task.status === 'pending' && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleGetDirections}
                                        className={`flex-1 ${compact ? 'h-7 text-[10px]' : 'h-8 text-xs font-semibold shadow-sm'}`}
                                        title="Open Google Maps Directions"
                                    >
                                        <ExternalLink className={`mr-1.5 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} /> Route
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onClaim?.(task.id)}
                                        className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm ${compact ? 'h-7 text-[10px]' : 'h-8 text-xs font-semibold'}`}
                                    >
                                        Claim Task
                                    </Button>
                                </div>
                            )}

                            {(task.status === 'in-progress') && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleGetDirections}
                                        className={`flex-1 ${compact ? 'h-7 text-[10px]' : 'h-8 text-xs font-semibold shadow-sm'}`}
                                    >
                                        <Navigation className={`mr-1.5 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} /> Map
                                    </Button>
                                    <Button
                                        size="sm"
                                        className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm ${compact ? 'h-7 text-[10px]' : 'h-8 text-xs font-semibold'}`}
                                        onClick={() => onVerify?.(task)}
                                    >
                                        <Camera className={`mr-1.5 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} /> Upload
                                    </Button>
                                </div>
                            )}

                            {(task.status === 'rejected') && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm h-8 text-xs font-semibold animate-pulse"
                                        onClick={() => onVerify?.(task)}
                                    >
                                        <Camera className="mr-1.5 h-3.5 w-3.5" /> Re-upload Proof
                                    </Button>
                                </div>
                            )}

                            {(task.status === 'collected' || task.status === 'verified') && (
                                <Button size="sm" variant="secondary" className="w-full cursor-default opacity-80 h-8 text-xs font-bold" disabled>
                                    <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Task Completed
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}
