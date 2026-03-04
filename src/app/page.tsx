"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Box, Shield, Zap, Sparkles, MapPin, Recycle, Award, CheckCircle2, TrendingUp, Users } from "lucide-react"
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

      <main className="relative z-10 flex flex-col items-center w-full mt-16 pb-24 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* Hero Section */}
        <section className="relative w-full flex flex-col items-center justify-center pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 text-center">
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
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mb-6 sm:mb-8 transition-all"
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
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl font-medium mb-8 sm:mb-10 px-4 sm:px-6 transition-all"
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
              <Button size="lg" className="w-full sm:w-auto rounded-xl sm:rounded-md h-12 px-8 text-base font-medium shadow-sm group bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5">
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
        <motion.section
          id="features"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-6xl px-4 sm:px-6 py-16 sm:py-24 border-t border-border/40"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              Built for speed and scale.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to modernize your local waste management logistics inside a single, unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/20 transition-all duration-300 group">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Box className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">AI Classification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload images of waste, and our models instantly categorize it for accurate routing and separation.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/20 transition-all duration-300 group">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-500">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Real-time Dispatch</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connects reports directly to the nearest active collector. Optimized for minimum latency and driving.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/20 transition-all duration-300 group">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-500">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Verified Impact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Proof-of-work protocols ensure every collection is physically verified before citizen points are awarded.
              </p>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-6xl px-4 sm:px-6 py-16 sm:py-24 border-t border-border/40"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              A transparent, unified workflow.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From reporting a completely new waste site to rewarding the citizens and collectors, the entire loop is managed in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border/40 z-0"></div>
            {/* Connecting lines for mobile */}
            <div className="block md:hidden absolute left-1/2 top-10 bottom-10 w-0.5 -translate-x-1/2 bg-border/40 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm border-2 border-border/50 shadow-sm text-foreground hover:scale-110 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300">
                <MapPin className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">1. Report</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                Citizens capture and report waste. AI identifies the category automatically.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm border-2 border-border/50 shadow-sm text-foreground hover:scale-110 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300">
                <Recycle className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">2. Collect</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                Drivers get optimized routes to collect waste efficiently based on proximity.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm border-2 border-border/50 shadow-sm text-foreground hover:scale-110 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300">
                <Award className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">3. Reward</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                Upon verification, points are distributed to active contributors and top collectors.
              </p>
            </div>
          </div>
        </motion.section>

        {/* System Impact / Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full border-t border-border/40 bg-muted/20 py-16 sm:py-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
                  Transforming local ecosystems.
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  By digitizing and democratizing waste management, we equip municipalities to hit their zero-waste targets faster while empowering the community.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-foreground font-medium">Reduced collection routing time</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-foreground font-medium">Actionable metrics for civic leaders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-foreground font-medium">Increased participation via gamification</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 shadow-sm hover:border-emerald-500/30 hover:bg-card/60 transition-all duration-300 hover:-translate-y-1">
                  <TrendingUp className="h-5 w-5 text-emerald-500 mb-2" />
                  <div className="text-3xl font-bold text-foreground">2x</div>
                  <div className="text-sm text-muted-foreground">Faster response rates</div>
                </div>
                <div className="flex flex-col gap-2 p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 shadow-sm hover:border-emerald-500/30 hover:bg-card/60 transition-all duration-300 hover:-translate-y-1">
                  <Users className="h-5 w-5 text-blue-500 mb-2" />
                  <div className="text-3xl font-bold text-foreground">10k+</div>
                  <div className="text-sm text-muted-foreground">Active citizens</div>
                </div>
                <div className="flex flex-col gap-2 p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 shadow-sm sm:col-span-2 hover:border-teal-500/30 hover:bg-card/60 transition-all duration-300 hover:-translate-y-1">
                  <Shield className="h-5 w-5 text-teal-500 mb-2" />
                  <div className="text-3xl lg:text-4xl font-bold text-foreground">100%</div>
                  <div className="text-sm text-muted-foreground">Traceability and audit logs for every assigned task</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">
            Ready to upgrade your city?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join the growing network of citizens, collectors, and administrators making neighborhoods cleaner and smarter.
          </p>
          <Link href="/register">
            <Button size="lg" className="rounded-xl h-12 px-8 text-base font-medium shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5">
              Get Started for Free
            </Button>
          </Link>
        </motion.section>

      </main>

      {/* Footer Minimalist */}
      <footer className="w-full border-t border-border/40 bg-background py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground font-medium">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Smart Waste Manager.
          </div>
        </div>
      </footer>
    </div>
  )
}
