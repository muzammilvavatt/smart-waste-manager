"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy, Medal, Award } from "lucide-react"

interface LeaderboardEntry {
    _id: string;
    name: string;
    points: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const response = await fetch('/api/leaderboard')
                if (response.ok) {
                    const data = await response.json()
                    setEntries(data)
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error)
            } finally {
                setLoading(false)
            }
        }
        fetchLeaderboard()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 px-4 sm:px-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
                    <Trophy className="text-yellow-500 h-6 w-6 sm:h-8 sm:w-8 shrink-0" /> Green Citizens Leaderboard
                </h1>
                <p className="text-sm sm:text-base text-gray-500">Top contributors to a cleaner city.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {entries.length === 0 ? (
                            <p className="text-center py-10 text-muted-foreground">No data available yet.</p>
                        ) : (
                            entries.map((entry, index) => (
                                <div
                                    key={entry._id}
                                    className={`flex items-center justify-between gap-4 p-3 sm:p-4 rounded-lg border ${index === 0 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10' :
                                        index === 1 ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50' :
                                            index === 2 ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10' :
                                                'bg-white dark:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 text-center font-bold text-lg">
                                            {index === 0 ? <Medal className="h-6 w-6 text-yellow-500 mx-auto" /> :
                                                index === 1 ? <Medal className="h-6 w-6 text-gray-400 mx-auto" /> :
                                                    index === 2 ? <Medal className="h-6 w-6 text-orange-400 mx-auto" /> :
                                                        index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold">{entry.name}</p>
                                            <p className="text-xs text-gray-500 uppercase">Sustainable Star</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-green-500" />
                                        <span className="text-xl font-black text-green-600 dark:text-green-400">{entry.points}</span>
                                        <span className="text-xs text-gray-500 font-medium">pts</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
