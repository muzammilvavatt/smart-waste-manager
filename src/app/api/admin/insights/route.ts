import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateAdminSummary } from '@/lib/gemini';

// Simple in-memory cache for API rate limit protection
// In a real production app (Vercel), you might use Redis or KV, but for a single instance
// this protects against rapid refreshes triggering Gemini repeatedly.
const cache = new Map<string, { summary: string, timestamp: number }>();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
    try {
        const session = await auth();
        // Ensure only admins can access this route
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.stats) {
            return NextResponse.json({ error: 'Stats payload required' }, { status: 400 });
        }

        // Cache Key is based on the incoming stats data stringified
        const cacheKey = JSON.stringify({
            total: body.stats.totalCollections,
            pending: body.stats.pendingTasks,
            active: body.stats.activeCollectors
        });

        // Check if we have a valid cached summary
        const cachedItem = cache.get(cacheKey);
        if (cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_DURATION_MS) {
            console.log("Serving AI Insight from CACHE");
            return NextResponse.json({ summary: cachedItem.summary });
        }

        console.log("Fetching new AI Insight from Gemini...");
        const summary = await generateAdminSummary(body.stats);

        // Save to cache
        cache.set(cacheKey, { summary, timestamp: Date.now() });

        return NextResponse.json({ summary });

    } catch (error) {
        console.error('AI Summary route error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI insights' },
            { status: 500 }
        );
    }
}
