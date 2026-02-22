import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await connectDB();

        // Fetch top 10 users with 'citizen' role, sorted by points
        const topUsers = await User.find({ role: 'citizen' })
            .sort({ points: -1 })
            .limit(10)
            .select('name points');

        return NextResponse.json(topUsers);
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
