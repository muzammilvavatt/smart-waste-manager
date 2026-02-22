import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
    try {
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
        await connectDB();

        const { wasteType, amount, location, coordinates, citizenId, imageUrl } =
            await request.json();

        if (!wasteType || !amount || !location || !citizenId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
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
