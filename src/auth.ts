import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const nextAuthResult = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    await connectDB();
                    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            points: user.points
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});

console.log('NextAuth Result Keys:', Object.keys(nextAuthResult));

export const { auth, signIn, signOut, handlers } = nextAuthResult;
