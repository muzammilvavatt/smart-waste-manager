import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // We return 200 even if user doesn't exist for security (prevent enumeration)
            // But for debugging/mocking, we might want to log it.
            console.log('Forgot Password: User not found for email:', email);
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        // Save token
        await ResetToken.create({
            email: email.toLowerCase(),
            token,
            expires,
        });

        // Mock Email Sending
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        console.log('---------------------------------------------------');
        console.log('🔐 PASSWORD RESET LINK (MOCK EMAIL):');
        console.log(`To: ${email}`);
        console.log(`Link: ${resetLink}`);
        console.log('---------------------------------------------------');

        return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
