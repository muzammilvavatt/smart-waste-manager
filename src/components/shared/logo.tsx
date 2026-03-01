import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2.5 group", className)}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-emerald-700 shadow-md shadow-primary/20 overflow-hidden transform transition-transform group-hover:scale-105">
                {/* Abstract geometric 'S' & 'W' & 'Recycle' motif */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                >
                    <path
                        d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-20"
                    />
                    <path
                        d="M7.5 14L12 18.5L16.5 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 5.5V17.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M7.5 10L12 5.5L16.5 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-50"
                    />
                </svg>
                {/* Inner shine */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-[10px]" />
            </div>
            <div className="flex flex-col justify-center leading-none">
                <span className="font-heading font-extrabold text-[17px] tracking-tight text-foreground flex items-center gap-[2px]">
                    Smart<span className="text-primary font-bold">Waste</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80 hidden sm:block">
                    Manager
                </span>
            </div>
        </div>
    )
}

