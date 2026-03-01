import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const userId = searchParams.get('userId');

        let query = {};

        if (role === 'citizen' && userId) {
            query = { citizenId: userId };
        } else if (role === 'collector') {
            // Collectors see pending tasks OR tasks assigned to them
            query = {
                $or: [
                    { status: 'pending' },
                    { collectorId: userId }
                ]
            };
        } else if (role === 'admin') {
            // Admins can see all tasks
            query = {};
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 });

        const formattedTasks = tasks.map((task) => ({
            id: task._id.toString(),
            wasteType: task.wasteType,
            amount: task.amount,
            location: task.location,
            coordinates: task.coordinates,
            date: task.date,
            status: task.status,
            citizenId: task.citizenId,
            collectorId: task.collectorId,
            imageUrl: task.imageUrl,
            proofImage: task.proofImage,
            isSuspicious: task.isSuspicious,
        }));

        return NextResponse.json(formattedTasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { wasteType, amount, location, coordinates, citizenId, imageUrl, imageHash, isSuspicious } =
            await request.json();

        if (!wasteType || !amount || !location || !citizenId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // ─── FRAUD PREVENTION 1: Rate Limiting ────────────────────────────────
        // Block more than 5 reports from the same user in a rolling 1-hour window
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentReports = await Task.countDocuments({
            citizenId,
            createdAt: { $gte: oneHourAgo }
        });
        if (recentReports >= 5) {
            console.warn(`[FRAUD] Rate limit hit for citizen ${citizenId}`);
            return NextResponse.json(
                { error: 'Too many reports. Please wait before submitting another report.' },
                { status: 429 }
            );
        }

        // ─── FRAUD PREVENTION 2: Duplicate Image Hash ─────────────────────────
        // Reject the same photo submitted more than once across the entire system
        if (imageHash) {
            const existingWithHash = await Task.findOne({ imageHash });
            if (existingWithHash) {
                console.warn(`[FRAUD] Duplicate image hash detected for citizen ${citizenId}`);
                return NextResponse.json(
                    { error: 'This image has already been used in a previous report. Please take a new photo.' },
                    { status: 400 }
                );
            }
        }

        const newTask = await Task.create({
            wasteType,
            amount,
            location,
            coordinates,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            citizenId,
            imageUrl: imageUrl || '/placeholder-waste.jpg',
            imageHash: imageHash || null,
            // If AI flagged "⚠️ SUSPICIOUS" in message, mark for admin review
            isSuspicious: isSuspicious || false,
        });

        return NextResponse.json(
            {
                id: newTask._id.toString(),
                wasteType: newTask.wasteType,
                amount: newTask.amount,
                location: newTask.location,
                coordinates: newTask.coordinates,
                date: newTask.date,
                status: newTask.status,
                citizenId: newTask.citizenId,
                imageUrl: newTask.imageUrl,
                isSuspicious: newTask.isSuspicious,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create task error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        // Depending on requirements, we might want only admins to delete or users to delete their own.
        // For now, require at least an active session, but prefer admin role.
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Task ID is required' },
                { status: 400 }
            );
        }

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Task deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete task error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
