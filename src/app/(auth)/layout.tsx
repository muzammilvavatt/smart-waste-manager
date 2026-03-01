import { Logo } from "@/components/shared/logo"
import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden px-4 md:px-0 py-12 md:py-0">
            {/* Very subtle background pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />

            {/* Content Container */}
            <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center">
                {/* Logo */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Link href="/" className="hover:opacity-80 transition-opacity flex justify-center">
                        <Logo />
                    </Link>
                </div>

                {/* Form Wrapper */}
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </div>
        </div>
    )
}
