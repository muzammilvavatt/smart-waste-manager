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

export default function WasteCategoryChart({ data }: WasteCategoryChartProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between h-full py-4">
            {data.length > 0 ? (
                <>
                    <div className="w-full md:w-1/2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => {
                                        const color = CATEGORY_COLORS[entry.name.toLowerCase().trim()] || CATEGORY_COLORS[entry.name] || DEFAULT_COLOR;
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => [`${value} Reports`, 'Count']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 mt-4 md:mt-0 px-4">
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                            {data.map((entry, index) => {
                                const total = data.reduce((acc, curr) => acc + curr.value, 0);
                                const percentage = ((entry.value / total) * 100).toFixed(1);
                                const color = CATEGORY_COLORS[entry.name.toLowerCase().trim()] || CATEGORY_COLORS[entry.name] || DEFAULT_COLOR;

                                return (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full shadow-sm"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.value} Reports</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
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
