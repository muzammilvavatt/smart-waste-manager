"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Box, Shield, Zap, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/shared/logo"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Home() {
  const router = useRouter()
  const { user, isInitialized, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(`/dashboard/${user.role}`)
    }
  }, [user, isLoading, router])

  if (!isInitialized || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground/90 selection:bg-primary/20 flex flex-col items-center">
      {/* Subtle modern background grid */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button className="h-9 px-3 sm:px-4 text-sm font-medium rounded-md" variant="default">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center w-full mt-16 pb-24">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs sm:text-sm font-medium text-muted-foreground mb-6 sm:mb-8"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5 sm:h-4 w-4 text-emerald-500" />
            Introducing Smart Waste Manager 2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mb-6 sm:mb-8"
            style={{ lineHeight: 1.1 }}
          >
            Manage waste <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              intelligently.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-medium mb-8 sm:mb-10 px-0 sm:px-4"
          >
            The modern civic platform to report, classify, and streamline waste collection. Clean streets, quantified impact, zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-0 sm:px-4 justify-center"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-xl sm:rounded-md h-12 px-8 text-base font-medium shadow-sm group bg-emerald-600 hover:bg-emerald-700 text-white">
                Start Deploying Impact <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl sm:rounded-md h-12 px-8 text-base font-medium border-border/50 hover:bg-muted/50 transition-all text-foreground">
                Explore Features
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Minimalist */}
        <section id="features" className="w-full max-w-6xl px-4 sm:px-6 py-16 sm:py-24 border-t border-border/40">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              Built for speed and scale.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to modernize your local waste management logistics inside a single, unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-card/50 shadow-sm">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Box className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">AI Classification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload images of waste, and our models instantly categorize it for accurate routing and separation.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-card/50 shadow-sm">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-500">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Real-time Dispatch</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connects reports directly to the nearest active collector. Optimized for minimum latency and driving.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-card/50 shadow-sm">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-500">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Verified Impact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Proof-of-work protocols ensure every collection is physically verified before citizen points are awarded.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Minimalist */}
      <footer className="w-full border-t border-border/40 bg-background py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Smart Waste Manager.
          </div>
        </div>
      </footer>
    </div>
  )
}
