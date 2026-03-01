import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { ReactNode, useState } from "react"
import { Loader2 } from "lucide-react"

interface SwipeAction {
    icon: ReactNode
    label: string
    color: string
    onAction: () => Promise<void> | void
}

interface SwipeableCardProps {
    children: ReactNode
    leftAction?: SwipeAction
    rightAction?: SwipeAction
    disabled?: boolean
}

export function SwipeableCard({ children, leftAction, rightAction, disabled = false }: SwipeableCardProps) {
    const x = useMotionValue(0)
    const [isActionActive, setIsActionActive] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Calculate background opacity and scale based on swipe distance
    const leftActionOpacity = useTransform(x, [0, 80], [0, 1])
    const rightActionOpacity = useTransform(x, [0, -80], [0, 1])
    const scale = useTransform(x, [-100, 0, 100], [1.1, 0.8, 1.1])

    const handleDragEnd = async (e: any, { offset, velocity }: any) => {
        if (disabled || isProcessing) return;

        const swipeThreshold = 100;
        const velocityThreshold = 500;

        if (leftAction && (offset.x > swipeThreshold || velocity.x > velocityThreshold)) {
            // Swipe Right -> Trigger Left Action (Revealed on the left)
            setIsActionActive(true)
            setIsProcessing(true)
            await animate(x, 400, { duration: 0.3 })
            try {
                await leftAction.onAction()
            } finally {
                setIsProcessing(false)
                setIsActionActive(false)
                animate(x, 0, { type: "spring", bounce: 0.5 })
            }
        } else if (rightAction && (offset.x < -swipeThreshold || velocity.x < -velocityThreshold)) {
            // Swipe Left -> Trigger Right Action (Revealed on the right)
            setIsActionActive(true)
            setIsProcessing(true)
            await animate(x, -400, { duration: 0.3 })
            try {
                await rightAction.onAction()
            } finally {
                setIsProcessing(false)
                setIsActionActive(false)
                animate(x, 0, { type: "spring", bounce: 0.5 })
            }
        } else {
            // Reset position
            animate(x, 0, { type: "spring", bounce: 0.5 })
        }
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-border/40 md:hidden block group">
            {/* Left Action Background */}
            {leftAction && (
                <motion.div
                    className="absolute inset-y-0 left-0 w-1/2 flex items-center pl-6 font-bold"
                    style={{ opacity: leftActionOpacity, backgroundColor: leftAction.color, color: 'white' }}
                >
                    <motion.div style={{ scale }} className="flex flex-col items-center gap-1">
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : leftAction.icon}
                        <span className="text-[10px] uppercase tracking-wider">{leftAction.label}</span>
                    </motion.div>
                </motion.div>
            )}

            {/* Right Action Background */}
            {rightAction && (
                <motion.div
                    className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-6 font-bold"
                    style={{ opacity: rightActionOpacity, backgroundColor: rightAction.color, color: 'white' }}
                >
                    <motion.div style={{ scale }} className="flex flex-col items-center gap-1">
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : rightAction.icon}
                        <span className="text-[10px] uppercase tracking-wider">{rightAction.label}</span>
                    </motion.div>
                </motion.div>
            )}

            {/* Draggable Foreground Content */}
            <motion.div
                style={{ x }}
                drag={disabled || isProcessing ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={rightAction && leftAction ? 0.8 : rightAction ? { left: 0.8, right: 0 } : leftAction ? { left: 0, right: 0.8 } : 0}
                onDragEnd={handleDragEnd}
                whileTap={disabled || isProcessing ? {} : { scale: 0.98, cursor: "grabbing" }}
                className="bg-background relative z-10 w-full h-full shadow-sm rounded-xl"
            >
                {children}
            </motion.div>
        </div>
    )
}
