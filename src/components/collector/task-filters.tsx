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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 bg-white dark:bg-gray-950 sticky top-0 z-10">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg dark:bg-gray-800 overflow-x-auto w-full sm:w-auto scrollbar-hide">
                {filters.map((f) => (
                    <Button
                        key={f.id}
                        variant={filter === f.id ? 'default' : 'ghost'}
                        onClick={() => setFilter(f.id)}
                        size="sm"
                        className={`rounded-md px-3 text-xs sm:text-sm whitespace-nowrap ${filter === f.id ? 'shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        {f.label}
                    </Button>
                ))}
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                    placeholder="Search..."
                    className="pl-9 h-9 w-full bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-950 transition-all rounded-full text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    )
}
