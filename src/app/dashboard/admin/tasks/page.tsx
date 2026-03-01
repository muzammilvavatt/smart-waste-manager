"use client"

import { useEffect, useState, useRef } from "react"
import { getTasks } from "@/lib/store"
import { CollectionTask } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// ... imports
import { Trash2, Loader2, RefreshCw, Search, Filter } from "lucide-react"
import toast from "react-hot-toast"
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog"

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<CollectionTask[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [isBulkDelete, setIsBulkDelete] = useState(false)

    // Advanced Filtering State
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

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
            setTasks(Array.isArray(data) ? data : [])
            setSelectedTaskIds(new Set()) // Reset selection on reload
        }).catch((e) => {
            console.error(e)
            setTasks([])
            toast.error("Failed to load tasks")
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

    // Derived filtered tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.collectorId && task.collectorId.toLowerCase().includes(searchTerm.toLowerCase()));

        if (statusFilter === "all") return matchesSearch;

        // Group statuses for simpler filtering
        if (statusFilter === "completed") {
            return matchesSearch && (task.status === "collected" || task.status === "verified");
        }
        if (statusFilter === "pending") {
            return matchesSearch && (task.status === "pending" || task.status === "in-progress");
        }

        return matchesSearch && task.status === statusFilter;
    });

    const toggleSelectAll = () => {
        if (selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0) {
            setSelectedTaskIds(new Set())
        } else {
            setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)))
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Task Management</h1>

                {/* Advanced Search & Filtering Header */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search location or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-[250px] pl-9 pr-4 py-2 text-sm border border-border/50 rounded-lg bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <div className="relative flex-shrink-0">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto pl-9 pr-8 py-2 text-sm border border-border/50 rounded-lg bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <Card ref={containerRef} className="border-none shadow-none md:border-solid md:shadow-sm bg-transparent md:bg-card">
                <CardHeader className="flex flex-row items-center justify-between px-0 md:px-6 pb-2 md:pb-6 sticky top-0 z-30 bg-background/90 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none md:static">
                    <CardTitle className="text-xl md:text-2xl">All Waste Reports</CardTitle>
                    {selectedTaskIds.size > 0 && (
                        <button
                            onClick={handleBulkDeleteClick}
                            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 text-[13px] md:text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors shadow-sm"
                        >
                            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            Delete ({selectedTaskIds.size})
                        </button>
                    )}
                </CardHeader>
                <CardContent className="px-0 md:px-6">
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
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 md:p-4 border-b border-border/40 bg-muted/20 md:bg-transparent rounded-t-xl md:rounded-none mb-2 md:mb-4">
                                    <span className="text-[13px] md:text-sm font-medium text-muted-foreground">
                                        Select All {filteredTasks.length} Reports
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 md:h-4 md:w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-transform active:scale-95"
                                        checked={selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-20 md:pb-6">
                                    {filteredTasks.map(task => {
                                        const isSelected = selectedTaskIds.has(task.id);
                                        const isCompleted = task.status === 'collected' || task.status === 'verified';

                                        return (
                                            <div
                                                key={task.id}
                                                className={`relative flex flex-col justify-between p-3.5 md:p-4 md:pt-5 rounded-xl md:rounded-2xl transition-all duration-200 
                                                    ${isSelected ? 'bg-blue-50/80 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 ring-1 ring-blue-500/20' : 'bg-background shadow-sm border border-border/40 hover:shadow-md hover:border-emerald-500/30 dark:bg-card'}
                                                    overflow-hidden group cursor-pointer
                                                `}
                                                onClick={(e) => {
                                                    // Prevent toggling if clicking the delete button directly
                                                    if ((e.target as HTMLElement).closest('button')) return;
                                                    // On mobile, clicking the card toggles selection for ease of use
                                                    if (window.innerWidth < 768) {
                                                        toggleSelectTask(task.id);
                                                    }
                                                }}
                                            >
                                                {/* Mobile Status Indicator Bar */}
                                                <div className={`md:hidden absolute left-0 top-0 bottom-0 w-1.5 ${isCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`} />

                                                <div className="flex items-start gap-3 pl-2 md:pl-0 w-full">
                                                    {/* Checkbox */}
                                                    <div className="shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-transform active:scale-90"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelectTask(task.id)}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                        <div className="font-bold flex items-center gap-2 text-[15px] md:text-base tracking-tight text-foreground truncate">
                                                            <span className="capitalize truncate">{task.wasteType} Waste</span>
                                                            <span className={`hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider ${isCompleted
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                                : 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                                                                }`}>{task.status}</span>
                                                        </div>
                                                        <div className="text-[12px] md:text-sm text-muted-foreground font-medium flex items-center gap-1.5 truncate mt-1">
                                                            <span className="truncate">{task.location}</span>
                                                            <span className="shrink-0 text-[10px] md:text-xs font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded shadow-sm">{task.amount}</span>
                                                        </div>
                                                        <div className="text-[11px] md:text-xs text-muted-foreground/70 font-medium pt-0.5">Rep: {task.date}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-border/40 pl-2 md:pl-0">
                                                    <div className="text-[11px] md:text-xs text-left">
                                                        <div className="font-medium text-foreground">
                                                            Collector: <span className={task.collectorId ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-orange-500 font-semibold'}>{task.collectorId ? 'Assigned' : 'Unassigned'}</span>
                                                        </div>
                                                        <div className="text-muted-foreground/60 font-mono mt-0.5">#{task.id}</div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(task.id);
                                                        }}
                                                        className="p-2 md:p-2.5 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white dark:hover:bg-red-500/80 rounded-full transition-all shrink-0 shadow-sm"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
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
