import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

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
        <Card className={cn("overflow-hidden relative group transition-all duration-300 border-border shadow-sm hover:shadow-md bg-card", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative px-6 pt-6">
                <CardTitle className="text-sm font-semibold text-muted-foreground tracking-tight">
                    {title}
                </CardTitle>
                <div className="p-1.5 bg-secondary/50 rounded-md text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-300">
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="z-10 relative pt-1">
                <div className="text-3xl font-extrabold tracking-tight text-foreground flex items-baseline gap-2">
                    {value}
                </div>
                {(trend || description) && (
                    <div className="flex items-center mt-2 gap-2">
                        {trend && (
                            <span className={cn(
                                "flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-sm",
                                trend.isPositive
                                    ? "text-emerald-700 bg-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "text-red-700 bg-red-100/50 dark:bg-red-500/10 dark:text-red-400"
                            )}>
                                {trend.isPositive ? <TrendingUp className="h-[10px] w-[10px] mr-1" /> : <TrendingDown className="h-[10px] w-[10px] mr-1" />}
                                {Math.abs(trend.value)}%
                            </span>
                        )}
                        <p className="text-[13px] text-muted-foreground truncate font-medium">
                            {trend?.label || description}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
