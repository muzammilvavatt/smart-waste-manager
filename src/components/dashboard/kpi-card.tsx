import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KpiCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    trend?: {
        value: number
        label: string
        isPositive: boolean
    }
    className?: string
    description?: string
}

export function KpiCard({ title, value, icon: Icon, trend, className, description }: KpiCardProps) {
    return (
        <Card className={cn("overflow-hidden relative group hover:shadow-lg transition-all duration-300 border-border/50", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-24 h-24 text-primary transform rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                    {title}
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="z-10 relative">
                <div className="text-3xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
                    {value}
                </div>
                {(trend || description) && (
                    <div className="flex items-center mt-1 space-x-2">
                        {trend && (
                            <span className={cn(
                                "flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                                trend.isPositive
                                    ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                            )}>
                                {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {Math.abs(trend.value)}%
                            </span>
                        )}
                        <p className="text-xs text-muted-foreground/80 truncate">
                            {trend?.label || description}
                        </p>
                    </div>
                )}

                {/* Decorative bottom line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </CardContent>
        </Card>
    )
}
