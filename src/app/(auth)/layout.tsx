import { Logo } from "@/components/shared/logo"
import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-950">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-900/30"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-yellow-900/30"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-900/30"></div>

            {/* Intense Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 dark:from-emerald-900/40 dark:via-teal-900/40 dark:to-cyan-900/40 z-0"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Glass Card Container */}
                <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/50 border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl p-8">
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <Logo className="scale-125" />
                        </Link>
                    </div>
                    {children}
                </div>

                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Smart Waste Manager. All rights reserved.
                </div>
            </div>
        </div>
    )
}
