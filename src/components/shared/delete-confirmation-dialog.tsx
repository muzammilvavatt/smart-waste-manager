"use client"

import { useEffect, useState } from "react"
import { Trash2, AlertTriangle, X } from "lucide-react"

interface DeleteConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
}

export function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Task",
    description = "Are you sure you want to delete this task? This action cannot be undone."
}: DeleteConfirmationDialogProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setVisible(true)
        } else {
            const timer = setTimeout(() => setVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!visible && !isOpen) return null

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
