"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Loader2, Mail, Lock, ShieldAlert } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const { login, isLoading, user, isInitialized } = useAuth()
    const router = useRouter()
    const [globalError, setGlobalError] = useState("")

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === "citizen") router.replace("/dashboard/citizen")
            else if (user.role === "collector") router.replace("/dashboard/collector")
            else if (user.role === "admin") router.replace("/dashboard/admin")
        }
    }, [user, isLoading, router])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    if (!isInitialized || user) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const onSubmit = async (data: LoginFormValues) => {
        setGlobalError("")
        try {
            await login(data.email, data.password)
            // Successful login will trigger user state update, causing the useEffect redirect to run
        } catch (err: any) {
            console.error("Login error:", err)
            setGlobalError("Invalid email or password.")
            toast.error("Login failed")
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-[420px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col space-y-2 text-center mb-4 sm:mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome back
                </h1>
                <p className="text-muted-foreground text-sm">
                    Enter your credentials to access your account
                </p>
            </div>

            <div className="bg-card border border-border/40 rounded-[2rem] p-6 sm:p-8 w-full relative overflow-hidden shadow-sm">


                <form className="flex flex-col gap-5 sm:gap-6" onSubmit={handleSubmit(onSubmit)}>
                    {globalError && (
                        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive font-medium border border-destructive/20 flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <p>{globalError}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-semibold text-foreground/90">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className={`h-12 pl-11 rounded-xl bg-background/50 border-border/50 transition-all ${errors.email ? "border-destructive/50 focus-visible:ring-destructive/30" : "focus-visible:border-primary/50 focus-visible:ring-primary/20"
                                    }`}
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-semibold text-foreground/90">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className={`h-12 pl-11 rounded-xl bg-background/50 border-border/50 transition-all ${errors.password ? "border-destructive/50 focus-visible:ring-destructive/30" : "focus-visible:border-primary/50 focus-visible:ring-primary/20"
                                    }`}
                                {...register("password")}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 rounded-xl font-semibold mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : null}
                        <span className="flex items-center justify-center gap-2">
                            {isLoading ? "Signing in..." : "Sign in to account"}
                        </span>
                    </Button>
                </form>
            </div>

            <div className="text-center mt-2">
                <p className="text-sm font-medium text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline transition-colors"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    )
}
