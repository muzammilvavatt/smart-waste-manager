import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./button"

interface BottomSheetProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
    // Prevent scrolling on body when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden block"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                            if (offset.y > 100 || velocity.y > 500) {
                                onClose()
                            }
                        }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[2rem] shadow-2xl border-t border-border/50 md:hidden block max-h-[90vh] flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0">
                            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 flex items-center justify-between shrink-0">
                            {title && <h2 className="text-xl font-bold tracking-tight">{title}</h2>}
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-auto bg-muted/50" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div
                            className="px-6 pb-24 overflow-y-auto overscroll-contain flex-1 pointer-events-auto"
                            onPointerDownCapture={(e) => e.stopPropagation()}
                        >
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
