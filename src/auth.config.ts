import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // If already logged in and on login/register page, redirect to dashboard
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
                    // Determine dashboard by role if possible, or default to generic dashboard
                    // Since we don't have role here easily without token expansion, we can redirect to a landing dashboard or root
                    // But for now, let's keep it simple. The middleware will handle protection.
                    // We'll let the user navigate freely for now or add role-based redirect in middleware logic later
                    return Response.redirect(new URL('/dashboard/citizen', nextUrl)); // Default to citizen dashboard or logic
                }
            }
            return true;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.points = token.points;
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.points = user.points;
            }
            return token;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
