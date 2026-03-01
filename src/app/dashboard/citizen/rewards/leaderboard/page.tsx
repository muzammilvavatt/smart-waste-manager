"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy, Medal, Award } from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"

interface LeaderboardEntry {
    _id: string;
    name: string;
    points: number;
    profileImage?: string;
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
        <div className="space-y-6 sm:space-y-8 pb-24 sm:pb-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1.5 pb-4 border-b border-border/40">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Trophy className="text-yellow-500 h-6 w-6 sm:h-8 sm:w-8 shrink-0" /> Green Citizens Leaderboard
                </h1>
                <p className="text-[13px] sm:text-base font-medium text-muted-foreground mt-1">Top contributors to a cleaner city.</p>
            </div>

            <Card className="rounded-[1.5rem] sm:rounded-[2rem] bg-transparent sm:bg-card border-none sm:border-solid shadow-none sm:shadow-lg overflow-hidden">
                {/* Decorative header background for desktop */}
                <div className="hidden sm:block h-32 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent absolute top-0 left-0 right-0 pointer-events-none" />

                <CardHeader className="px-0 sm:px-8 pb-4 sm:pb-8 pt-0 sm:pt-8 relative">
                    <CardTitle className="text-xl sm:text-2xl tracking-tight flex items-center gap-2">
                        Top Contributions
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 sm:px-8 pb-8 pt-0 relative">
                    <div className="space-y-3 sm:space-y-4">
                        {entries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-[1.5rem] border border-border/40">
                                <Trophy className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-muted-foreground font-medium">No data available yet.</p>
                            </div>
                        ) : (
                            entries.map((entry, index) => (
                                <div
                                    key={entry._id}
                                    className={`relative overflow-hidden flex items-center justify-between gap-4 p-4 sm:p-6 rounded-[1.25rem] sm:rounded-2xl border transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] ${index === 0 ? 'bg-gradient-to-br from-yellow-50 to-amber-100/50 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/10 dark:border-yellow-700/50 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.15)]' :
                                        index === 1 ? 'bg-gradient-to-br from-zinc-50 to-slate-100/50 border-zinc-200 dark:from-zinc-800/40 dark:to-zinc-900/40 dark:border-zinc-700 shadow-sm' :
                                            index === 2 ? 'bg-gradient-to-br from-orange-50 to-red-50/50 border-orange-200 dark:from-orange-900/20 dark:to-red-900/10 dark:border-orange-800/40 shadow-sm' :
                                                'bg-card dark:bg-zinc-900/50 border-border/60 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    {/* Subtle shine effect for #1 */}
                                    {index === 0 && (
                                        <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent to-white/20 dark:to-white/5 pointer-events-none mask-image-linear-gradient" />
                                    )}

                                    <div className="flex items-center gap-3 sm:gap-5 relative z-10">
                                        <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-black text-lg sm:text-xl shadow-inner ${index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/30' :
                                            index === 1 ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-500 border border-orange-200 dark:border-orange-500/30' :
                                                    'bg-secondary text-muted-foreground border border-border/50'
                                            }`}>
                                            {index === 0 ? <Medal className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-sm" /> :
                                                index === 1 ? <Medal className="h-5 w-5 sm:h-6 sm:w-6" /> :
                                                    index === 2 ? <Medal className="h-5 w-5 sm:h-6 sm:w-6" /> :
                                                        index + 1}
                                        </div>
                                        <UserAvatar
                                            avatarId={entry.profileImage}
                                            fallbackName={entry.name}
                                            className="h-10 w-10 sm:h-12 sm:w-12 border border-border/50 shadow-sm"
                                            iconClassName="h-5 w-5 sm:h-6 sm:w-6"
                                        />
                                        <div>
                                            <p className={`font-bold tracking-tight ${index === 0 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
                                                {entry.name}
                                            </p>
                                            <p className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider mt-0.5 ${index === 0 ? 'text-yellow-600/80 dark:text-yellow-500/80' :
                                                index === 1 ? 'text-zinc-500/80 dark:text-zinc-400/80' :
                                                    index === 2 ? 'text-orange-600/80 dark:text-orange-500/80' :
                                                        'text-muted-foreground'
                                                }`}>
                                                Sustainable Star
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border relative z-10 ${index === 0 ? 'bg-yellow-500 text-white border-yellow-600 shadow-md' :
                                        'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30'
                                        }`}>
                                        <Award className={`h-4 w-4 sm:h-5 sm:w-5 ${index === 0 ? 'text-yellow-100' : 'text-emerald-600 dark:text-emerald-500'}`} />
                                        <span className={`text-sm sm:text-lg font-black ${index === 0 ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                            {entry.points}
                                        </span>
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
