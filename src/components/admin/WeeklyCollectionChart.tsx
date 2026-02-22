"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WeeklyCollectionChartProps {
    data: Array<{ name: string; date: string; waste: number }>;
}

export default function WeeklyCollectionChart({ data }: WeeklyCollectionChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="waste" fill="#22c55e" radius={[4, 4, 0, 0]} name="Collections" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
