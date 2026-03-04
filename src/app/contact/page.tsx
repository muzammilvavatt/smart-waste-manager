"use client"

import Link from "next/link"
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col items-center pb-24">
            {/* Subtle modern background grid */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />

            {/* Decorative background glow */}
            <div className="absolute top-0 right-1/4 w-full max-w-3xl h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Header */}
            <header className="w-full border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto flex w-full max-w-5xl items-center px-4 sm:px-6 h-16">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 -ml-3 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="relative z-10 w-full max-w-5xl mt-16 px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                        Get in touch
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have questions about integrating Smart Waste Manager into your municipality? Or just want to say hi? We'd love to hear from you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col gap-10"
                    >
                        <div className="flex gap-4">
                            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Chat with sales</h3>
                                <p className="text-muted-foreground mb-4">Speak to our friendly team about custom enterprise plans.</p>
                                <a href="mailto:sales@smartwastemanager.com" className="font-medium text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 transition-colors">sales@smartwastemanager.com</a>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-500">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Support</h3>
                                <p className="text-muted-foreground mb-4">We're here to help with any technical or account queries.</p>
                                <a href="mailto:support@smartwastemanager.com" className="font-medium text-teal-600 dark:text-teal-500 hover:text-teal-700 transition-colors">support@smartwastemanager.com</a>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-500">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Visit us</h3>
                                <p className="text-muted-foreground mb-4">Visit our office headquarters.</p>
                                <address className="not-italic text-sm text-muted-foreground leading-relaxed">
                                    100 Innovation Drive<br />
                                    Tech District<br />
                                    San Francisco, CA 94105
                                </address>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-500">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Call us</h3>
                                <p className="text-muted-foreground mb-4">Mon-Fri from 8am to 5pm.</p>
                                <a href="tel:+15550000000" className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-700 transition-colors">+1 (555) 000-0000</a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="p-8 rounded-3xl bg-card border border-border/40 shadow-xl shadow-black/5"
                    >
                        <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); alert("Form submitted!"); }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="first-name">First name</Label>
                                    <Input id="first-name" placeholder="John" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last-name">Last name</Label>
                                    <Input id="last-name" placeholder="Doe" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="john@company.com" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="How can we help?"
                                    className="min-h-[150px] resize-y"
                                    required
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                                Send message
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
