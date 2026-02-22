import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { WASTE_POINTS, WasteCategory } from '@/lib/constants';



export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await request.json();
        const { status, collectorId, proofImage } = body;

        console.log(`[PATCH] Updating task ${id} with status ${status}`);

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const task = await Task.findById(id);

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        const previousStatus = task.status;

        // Update task

        // Map 'completed' to 'collected' to match Mongoose schema
        if (status === 'completed') {
            task.status = 'collected';
        } else {
            task.status = status;
        }
        if (collectorId) task.collectorId = collectorId;
        if (proofImage) task.proofImage = proofImage;
        await task.save();

        // Award points when task is verified (fraud prevention)
        if (status === 'verified' && previousStatus !== 'verified') {
            const citizen = await User.findById(task.citizenId);
            if (citizen) {
                // Calculate points based on waste type
                const wasteType = task.wasteType.toLowerCase() as WasteCategory;
                const pointsToAdd = WASTE_POINTS[wasteType] || WASTE_POINTS.general;

                citizen.points = (citizen.points || 0) + pointsToAdd;
                await citizen.save();
                console.log(`✅ Awarded ${pointsToAdd} points to citizen ${task.citizenId} for ${wasteType} waste`);
            }
        }

        return NextResponse.json({
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
        });
    } catch (error) {
        console.error('Update task error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
