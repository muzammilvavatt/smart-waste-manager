"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
    organic: '#4CAF50', // Green
    plastic: '#2196F3', // Blue
    metal: '#9E9E9E', // Gray
    paper: '#FFC107', // Amber
    hazardous: '#F44336', // Red
    general: '#9C27B0', // Purple
    // Lowercase fallbacks if needed
    Organic: '#4CAF50',
    Plastic: '#2196F3',
    Metal: '#9E9E9E',
    Paper: '#FFC107',
    Hazardous: '#F44336',
    General: '#9C27B0',
};

const DEFAULT_COLOR = '#8884d8';

interface WasteCategoryChartProps {
    data: Array<{ name: string; value: number }>;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const color = CATEGORY_COLORS[data.name.toLowerCase().trim()] || CATEGORY_COLORS[data.name] || DEFAULT_COLOR;

        return (
            <div className="bg-card/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-border/50 text-sm animate-in zoom-in-95 duration-200 min-w-[140px]">
                <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-border/50">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                    <span className="font-semibold text-foreground capitalize">{data.name}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-0.5">Tasks</span>
                    <span className="text-foreground font-bold text-lg leading-none">{data.value}</span>
                </div>
            </div>
        )
    }
    return null
}

export default function WasteCategoryChart({ data }: WasteCategoryChartProps) {
    return (
        <div className="flex flex-col items-center justify-start h-full w-full">
            {data.length > 0 ? (
                <>
                    <div className="w-full h-[180px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="65%"
                                    outerRadius="85%"
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                >
                                    {data.map((entry, index) => {
                                        const color = CATEGORY_COLORS[entry.name.toLowerCase().trim()] || CATEGORY_COLORS[entry.name] || DEFAULT_COLOR;
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={color}
                                                stroke="hsl(var(--card))"
                                                strokeWidth={3}
                                                className="hover:opacity-80 transition-opacity duration-200 cursor-pointer outline-none"
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full mt-4 flex-1 min-h-0 px-1">
                        <div className="grid grid-cols-2 gap-2 h-full content-start overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 pb-2">
                            {data.map((entry, index) => {
                                const total = data.reduce((acc, curr) => acc + curr.value, 0);
                                const percentage = ((entry.value / total) * 100).toFixed(1);
                                const color = CATEGORY_COLORS[entry.name.toLowerCase().trim()] || CATEGORY_COLORS[entry.name] || DEFAULT_COLOR;

                                return (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-border/40 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[60px]">{entry.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{entry.value}</span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-muted-foreground">No data available</div>
            )}
        </div>
    )
}
