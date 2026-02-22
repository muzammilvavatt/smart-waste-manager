import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
        }

        // Find token
        const resetToken = await ResetToken.findOne({ token });

        if (!resetToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        // Check expiration (although TTL index handles deletion, it might not be instant)
        if (resetToken.expires < new Date()) {
            await ResetToken.deleteOne({ _id: resetToken._id });
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
        }

        // Find user
        const user = await User.findOne({ email: resetToken.email.toLowerCase() });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        // Delete token
        await ResetToken.deleteOne({ _id: resetToken._id });

        return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
