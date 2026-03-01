import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

interface TaskFiltersProps {
    filter: string;
    setFilter: (filter: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export function TaskFilters({ filter, setFilter, searchQuery, setSearchQuery }: TaskFiltersProps) {
    const filters = [
        { id: 'all', label: 'All Tasks' },
        { id: 'pending', label: 'Pending' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'collected', label: 'Completed' },
    ]

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="flex gap-1.5 sm:gap-1 p-1 rounded-xl sm:bg-gray-100 sm:dark:bg-gray-800 overflow-x-auto w-full sm:w-auto scrollbar-hide [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {filters.map((f) => (
                    <Button
                        key={f.id}
                        variant={filter === f.id ? 'default' : 'ghost'}
                        onClick={() => setFilter(f.id)}
                        size="sm"
                        className={`rounded-full sm:rounded-md px-4 sm:px-3 h-8 sm:h-9 text-[13px] sm:text-sm whitespace-nowrap font-semibold tracking-tight transition-all
                            ${filter === f.id
                                ? 'shadow-md bg-foreground text-background sm:bg-primary sm:text-primary-foreground'
                                : 'bg-muted/50 sm:bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    >
                        {f.label}
                    </Button>
                ))}
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input
                    placeholder="Search tasks..."
                    className="pl-9 h-10 w-full bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all rounded-full text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    )
}
