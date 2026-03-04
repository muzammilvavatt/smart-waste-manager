"use client"

import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col items-center pb-24">
            {/* Subtle modern background grid */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />

            {/* Header */}
            <header className="w-full border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto flex w-full max-w-4xl items-center px-4 sm:px-6 h-16">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 -ml-3 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="relative z-10 flex flex-col items-center w-full mt-12 px-4 sm:px-6">
                <article className="w-full max-w-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-500">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Terms of Service</h1>
                    </div>

                    <p className="text-muted-foreground text-lg mb-12">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>

                    <section className="space-y-12 text-foreground/90 leading-relaxed">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
                            <p>By accessing or using Smart Waste Manager 2.0, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. Use License</h2>
                            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Smart Waste Manager 2.0 for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>modify or copy the materials;</li>
                                <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                                <li>attempt to decompile or reverse engineer any software contained on Smart Waste Manager 2.0;</li>
                                <li>remove any copyright or other proprietary notations from the materials; or</li>
                                <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
                            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Platform Rewards</h2>
                            <p>Any points, rewards, or gamified elements earned through the platform have no cash value and cannot be exchanged for fiat currency unless explicitly stated in specific municipal programs. We reserve the right to modify the reward structure at any time.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">5. Limitation of Liability</h2>
                            <p>In no event shall Smart Waste Manager 2.0 or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">6. Contact Us</h2>
                            <p>If you have any questions about these Terms, please contact us at <a href="mailto:legal@smartwastemanager.com" className="text-teal-600 dark:text-teal-500 hover:underline">legal@smartwastemanager.com</a>.</p>
                        </div>
                    </section>
                </article>
            </main>
        </div>
    )
}
