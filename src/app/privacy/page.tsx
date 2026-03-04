"use client"

import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
                    </div>

                    <p className="text-muted-foreground text-lg mb-12">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>

                    <section className="space-y-12 text-foreground/90 leading-relaxed">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                            <p>Welcome to Smart Waste Manager 2.0. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. The Data We Collect About You</h2>
                            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-foreground">Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                                <li><strong className="text-foreground">Contact Data</strong> includes email address and telephone numbers.</li>
                                <li><strong className="text-foreground">Location Data</strong> includes GPS coordinates when you report waste.</li>
                                <li><strong className="text-foreground">Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Personal Data</h2>
                            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                <li>Where we need to comply with a legal obligation.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
                            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">5. Contact Us</h2>
                            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at <a href="mailto:privacy@smartwastemanager.com" className="text-emerald-600 dark:text-emerald-500 hover:underline">privacy@smartwastemanager.com</a>.</p>
                        </div>
                    </section>
                </article>
            </main>
        </div>
    )
}
