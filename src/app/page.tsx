"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Leaf, Recycle, ArrowRight, Map, BarChart } from "lucide-react"
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
      if (user.role === "citizen") router.replace("/dashboard/citizen")
      else if (user.role === "collector") router.replace("/dashboard/collector")
      else if (user.role === "admin") router.replace("/dashboard/admin")
    }
  }, [user, isLoading, router])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!isInitialized || user) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100 via-background to-background dark:from-green-900/20 dark:via-background dark:to-background">
      <header className="w-full px-4 md:px-6 lg:px-12 pt-6 lg:pt-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo className="scale-110 origin-left" />
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold px-6">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="font-semibold px-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col justify-center p-4 md:p-6 lg:p-12 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={container}
            >
              <motion.h1
                variants={item}
                className="text-3xl sm:text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl text-gray-900 dark:text-gray-50"
              >
                Waste Management <span className="text-primary">Reimagined</span>
              </motion.h1>
              <motion.p
                variants={item}
                className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
              >
                Join the revolution in sustainable living. AI-powered waste classification, efficient collection management, and rewards for eco-friendly citizens.
              </motion.p>
              <motion.div variants={item} className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Join Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Leaf, color: "text-green-500", title: "AI Recognition", desc: "Instantly classify waste types with our advanced AI scanner." },
                { icon: Recycle, color: "text-blue-500", title: "Earn Rewards", desc: "Get points for every correct disposal and climb the leaderboard." },
                { icon: Map, color: "text-orange-500", title: "Smart Collection", desc: "Optimized routes and real-time tracking for collectors." },
                { icon: BarChart, color: "text-purple-500", title: "City Analytics", desc: "Comprehensive data for better urban planning." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col gap-2 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800"
                >
                  <feature.icon className={`h-10 w-10 ${feature.color}`} />
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
