"use client"

import { useEffect, useState, useRef } from "react"
import { getTasks } from "@/lib/store"
import { CollectionTask } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// ... imports
import { Trash2, Loader2, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog"

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<CollectionTask[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [isBulkDelete, setIsBulkDelete] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadTasks()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                selectedTaskIds.size > 0 &&
                !deleteModalOpen
            ) {
                // Check if the click was on the delete button in the header (which might be outside the container ref if we only wrap the list)
                // For now, I'll wrap the entire card content or handle it by ensuring the containerRef covers the necessary area.
                // Actually, if I wrap the CardContent, the delete button in CardHeader is outside.
                // So clicking "Delete Selected" might clear selection before action triggers if not careful.
                // But the "Delete Selected" button is only present when items are selected. 
                // A better approach is to wrap the whole Card or check if click target is NOT the delete button.

                // Let's rely on the containerRef checking. I will attach the ref to the main div wrapper or a specific container.
                setSelectedTaskIds(new Set())
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [selectedTaskIds, deleteModalOpen])

    const loadTasks = () => {
        setLoading(true)
        getTasks('admin').then((data) => {
            setTasks(data)
            setSelectedTaskIds(new Set()) // Reset selection on reload
        }).finally(() => {
            setLoading(false)
        })
    }

    const handleDeleteClick = (taskId: string) => {
        setTaskToDelete(taskId)
        setIsBulkDelete(false)
        setDeleteModalOpen(true)
    }

    const handleBulkDeleteClick = () => {
        setIsBulkDelete(true)
        setDeleteModalOpen(true)
    }

    const toggleSelectAll = () => {
        if (selectedTaskIds.size === tasks.length && tasks.length > 0) {
            setSelectedTaskIds(new Set())
        } else {
            setSelectedTaskIds(new Set(tasks.map(t => t.id)))
        }
    }

    const toggleSelectTask = (taskId: string) => {
        const newSelected = new Set(selectedTaskIds)
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId)
        } else {
            newSelected.add(taskId)
        }
        setSelectedTaskIds(newSelected)
    }

    const handleConfirmDelete = async () => {
        if (isBulkDelete) {
            await handleBulkDelete()
        } else {
            if (!taskToDelete) return
            await deleteSingleTask(taskToDelete)
        }
        setDeleteModalOpen(false)
        setTaskToDelete(null)
        setIsBulkDelete(false)
    }

    const deleteSingleTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks?id=${taskId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Task deleted successfully')
                loadTasks()
            } else {
                toast.error('Failed to delete task')
            }
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Error deleting task')
        }
    }

    const handleBulkDelete = async () => {
        try {
            const deletePromises = Array.from(selectedTaskIds).map(id =>
                fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
            )

            await Promise.all(deletePromises)

            toast.success(`${selectedTaskIds.size} tasks deleted successfully`)
            loadTasks()
        } catch (error) {
            console.error('Bulk delete error:', error)
            toast.error('Error deleting tasks')
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Task Management</h1>

            <Card ref={containerRef}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Waste Reports</CardTitle>
                    {selectedTaskIds.size > 0 && (
                        <button
                            onClick={handleBulkDeleteClick}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Selected ({selectedTaskIds.size})
                        </button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                                <p>Loading tasks...</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
                                <div className="p-4 bg-muted/50 rounded-full mb-3">
                                    <Trash2 className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-lg font-medium">No waste reports found</p>
                                <p className="text-sm">New reports from citizens will appear here.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-end gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm font-medium text-gray-500">Select All</span>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                        checked={selectedTaskIds.size === tasks.length && tasks.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                                {tasks.map(task => (
                                    <div key={task.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg transition-colors ${selectedTaskIds.has(task.id) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                        <div className="flex flex-col gap-1">
                                            <div className="font-bold flex items-center gap-2">
                                                <span className="capitalize">{task.wasteType} Waste</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${(task.status === 'collected' || task.status === 'verified')
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : 'border-orange-200 bg-orange-50 text-orange-700'
                                                    }`}>{task.status}</span>
                                            </div>
                                            <div className="text-sm text-gray-500">{task.location} • {task.amount}</div>
                                            <div className="text-gray-400 text-xs">Reported: {task.date}</div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                                            <div className="hidden md:block text-sm text-right">
                                                <div className="font-medium text-gray-900 dark:text-gray-200">Collector: {task.collectorId ? 'Assigned' : 'Unassigned'}</div>
                                                <div className="text-gray-500">ID: #{task.id}</div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteClick(task.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete Task"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                                checked={selectedTaskIds.has(task.id)}
                                                onChange={() => toggleSelectTask(task.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <DeleteConfirmationDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={isBulkDelete ? `Delete ${selectedTaskIds.size} Reports?` : "Delete Waste Report?"}
                description={isBulkDelete
                    ? `This will permanently delete the ${selectedTaskIds.size} selected waste reports. This action cannot be undone.`
                    : "This will permanently delete this waste report from the system. This action cannot be undone."
                }
            />
        </div>
    )
}
