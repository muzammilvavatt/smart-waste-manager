import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Increase body size limit for base64 image uploads
export const maxDuration = 10; // This function can run for a maximum of 10 seconds
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        // Only admins can fetch the entire user list
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const users = await User.find({}).sort({ createdAt: -1 });

        const formattedUsers = users.map((user) => ({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            points: user.points,
            profileImage: user.profileImage || undefined,
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
        const session = await auth();
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Handle both JSON (legacy) and FormData (new image upload)
        let requestBody: any = {};
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            requestBody.id = formData.get("id");
            requestBody.role = formData.get("role");
            requestBody.points = formData.get("points") ? Number(formData.get("points")) : undefined;
            requestBody.name = formData.get("name");
            requestBody.email = formData.get("email");
            requestBody.password = formData.get("password");
            requestBody.profileImage = formData.get("profileImage");
        } else {
            requestBody = await request.json();
        }

        console.log("PATCH /api/users request received for ID:", requestBody.id);
        const { id, role, points, password, profileImage } = requestBody;

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const isSelf = session.user.id === id;
        const isAdmin = session.user.role === 'admin';

        if (!isAdmin && !isSelf) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updateData: any = {};
        if (isAdmin && role) updateData.role = role;
        if (isAdmin && points !== undefined) updateData.points = points;
        if (requestBody.name) updateData.name = requestBody.name;
        if (requestBody.email) updateData.email = requestBody.email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (profileImage !== undefined && profileImage !== null && profileImage !== "null") {
            if (typeof profileImage === 'string' && profileImage.startsWith('data:image')) {
                try {
                    // Extract base64 data
                    const base64Data = profileImage.replace(/^data:image\/\w+;base64,/, "");
                    const buffer = Buffer.from(base64Data, 'base64');

                    // Ensure directory exists
                    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
                    await mkdir(uploadDir, { recursive: true });

                    // Save file
                    const fileName = `${id}-${Date.now()}.png`;
                    const filePath = path.join(uploadDir, fileName);
                    await writeFile(filePath, buffer);

                    // Set public URL
                    updateData.profileImage = `/uploads/avatars/${fileName}`;
                } catch (err) {
                    console.error("Failed to save avatar image", err);
                    updateData.profileImage = profileImage; // Fallback to storing raw if file write fails (though not ideal)
                }
            } else {
                updateData.profileImage = profileImage;
            }
        } else if (profileImage === null || profileImage === "null" || profileImage === "") {
            // Handle avatar removal explicitly
            updateData.profileImage = "";
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
            profileImage: updatedUser.profileImage,
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

