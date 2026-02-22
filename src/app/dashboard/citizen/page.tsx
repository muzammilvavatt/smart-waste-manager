"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getTasks } from "@/lib/store"
import { CollectionTask } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Leaf, MapPin, Calendar, Clock, Loader2, Trophy } from "lucide-react"
import { motion } from "framer-motion"

export default function CitizenDashboard() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState<CollectionTask[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTasks() {
            if (user) {
                try {
                    const data = await getTasks("citizen", user.id)
                    setTasks(data)
                } catch (error) {
                    console.error("Failed to fetch tasks", error)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchTasks()
    }, [user])

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            className="space-y-6"
            initial="hidden"
            animate="show"
            variants={container}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Welcome, {user?.name}</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Link href="/dashboard/citizen/rewards/leaderboard" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard
                        </Button>
                    </Link>
                    <Link href="/dashboard/citizen/upload" className="w-full sm:w-auto">
                        <Button className="w-full gap-2">
                            <Leaf className="h-4 w-4" /> Report Waste
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <motion.div variants={item} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-card">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Points</h3>
                        <Leaf className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">{user?.points || 0}</div>
                </motion.div>
                <motion.div variants={item} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-card">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Reports Submitted</h3>
                        <MapPin className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">{tasks.length}</div>
                    <p className="text-xs text-muted-foreground">Lifetime contributions</p>
                </motion.div>
                <motion.div variants={item} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-card">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Pending Pickups</h3>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</div>
                </motion.div>
            </div>

            <motion.div variants={item} className="rounded-xl border bg-white shadow-sm dark:bg-card">
                <div className="p-6">
                    <h3 className="text-lg font-medium">Recent Reports</h3>
                </div>
                <div className="border-t p-6">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">No reports yet. Start by reporting waste!</div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-700">
                                            {task.wasteType === 'plastic' ? '🥤' : task.wasteType === 'organic' ? '🍎' : '🗑️'}
                                        </div>
                                        <div>
                                            <p className="font-medium capitalize">{task.wasteType} Waste</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="h-3 w-3" /> {task.date}
                                                <span>•</span>
                                                <span className={`${(task.status === 'verified') ? 'text-green-600' :
                                                    (task.status === 'collected') ? 'text-blue-600' :
                                                        task.status === 'rejected' ? 'text-red-600' :
                                                            'text-yellow-600 capitalize'
                                                    } font-medium`}>{task.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-medium">
                                        {task.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}
