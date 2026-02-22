import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d';

        await connectDB();

        // Calculate start date based on range
        let startDate: Date | null = new Date();
        let daysToSubtract = 7;

        if (range === '30d') {
            daysToSubtract = 30;
            startDate.setDate(startDate.getDate() - 30);
        } else if (range === 'all') {
            startDate = null; // No date filter
            daysToSubtract = 30; // Default graph to 30 days if 'all' (or maybe longer, but let's limit graph points) -> Actually for 'all' we might just show last 30 days trend or all time trend. Let's stick to last 30 days for graph readability or make it dynamic.
            // For simplicity in this iteration:
            // - 'all' will count ALL stats.
            // - Graph will show last 30 days regardless of 'all' to avoid UI clutter, OR we could show aggregated months.
            // Let's make graph follow range for 7d/30d. For 'all', show last 6 months? Or just 30 days.
            // Let's treat 'all' as "All Time Stats" but "Last 30 Days Graph" to keep chart readable.
        } else {
            // Default 7d
            startDate.setDate(startDate.getDate() - 7);
        }

        // Date Query Filter
        const dateFilter = startDate ? { date: { $gte: startDate.toISOString().split('T')[0] } } : {};
        // For counts that don't have a 'date' field (like User/Task status), we might not filter by date unless we have createdAt.
        // Task has 'date' (collection date). User has... likely createdAt but maybe not in this model version.
        // Let's apply filter primarily to COLLECTION TASKS and GRAPHS.
        // Users: usually we want TOTAL users, not "new users in last 7 days" unless specified. 
        // Let's assume the Dashboard is "Current State" + "Recent Activity".
        // KpiCards:
        // - Total Users: All time (usually)
        // - Total Collections: All time OR Filtered? Context implies "City Overview" -> arguably All Time state. 
        // HOWEVER, "Filter" usually implies "Show me what happened in this period". 
        // Let's make Collections and Revenue (if any) follow the filter. Users usually stay All Time.

        // Filter for Collections (Tasks)
        const taskFilter: any = { status: { $in: ['collected', 'verified'] } };
        if (startDate) {
            taskFilter.date = { $gte: startDate.toISOString().split('T')[0] };
        }

        const totalUsers = await User.countDocuments({}); // Keep total users global
        const totalCollections = await Task.countDocuments(taskFilter);
        const pendingTasks = await Task.countDocuments({ status: 'pending' }); // Current pending is always "now"
        const activeCollectors = await User.countDocuments({ role: 'collector' });

        // 2. Weekly/Daily Collection Overview
        // If range is 7d, show 7 days. If 30d, show 30 days. If all, show last 30 days.
        const chartDays = range === '30d' ? 30 : 7;

        const chartStartDate = new Date();
        chartStartDate.setDate(chartStartDate.getDate() - chartDays);
        const chartStartDateStr = chartStartDate.toISOString().split('T')[0];

        const weeklyStatsRaw = await Task.aggregate([
            {
                $match: {
                    status: { $in: ['collected', 'verified'] },
                    date: { $gte: chartStartDateStr }
                }
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const weeklyStats = [];
        for (let i = chartDays - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            const found = weeklyStatsRaw.find(item => item._id === dateStr);
            weeklyStats.push({
                name: dayName, // Short format
                date: dateStr,
                waste: found ? found.count : 0
            });
        }

        // 3. Waste Categories (Pie Chart) - Apply the same date filter as total collections
        const wasteTypeStatsRaw = await Task.aggregate([
            {
                $match: taskFilter // Apply date filter here too
            },
            {
                $group: {
                    _id: "$wasteType",
                    value: { $sum: 1 }
                }
            }
        ]);

        const wasteTypeStats = wasteTypeStatsRaw.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.value
        }));

        return NextResponse.json({
            totalUsers,
            totalCollections,
            pendingTasks,
            activeCollectors,
            weeklyStats,
            wasteTypeStats
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
