import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { email, name, password } = await request.json();
        const role = 'citizen'; // Force citizen role for public registration

        if (!email || !name || !password) {
            return NextResponse.json(
                { error: 'Email, name, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            email: email.toLowerCase(),
            name,
            role,
            points: role === 'citizen' ? 0 : undefined,
            password: hashedPassword,
        });

        return NextResponse.json(
            {
                id: newUser._id.toString(),
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                points: newUser.points,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
