import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const users = await User.find({}).sort({ createdAt: -1 });

        const formattedUsers = users.map((user) => ({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            points: user.points,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Get users error:', error);
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
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'User deleted successfully',
            id: userId
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const requestBody = await request.json();
        const { id, role, points, password } = requestBody;

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (role) updateData.role = role;
        if (points !== undefined) updateData.points = points;
        if (requestBody.name) updateData.name = requestBody.name;
        if (requestBody.email) updateData.email = requestBody.email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            points: updatedUser.points,
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

