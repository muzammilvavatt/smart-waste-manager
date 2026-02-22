import { Leaf } from "lucide-react"

export function Logo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 font-bold text-xl tracking-tight leading-none">
                <span className="text-gray-900 dark:text-gray-50">Smart</span>
                <span className="text-primary">Waste</span>
            </div>
        </div>
    )
}
