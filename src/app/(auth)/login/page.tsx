"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/shared/logo"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
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
            <div className="flex justify-center items-center min-h-[400px]">
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
        <div className="grid gap-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Sign In</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your email below to login to your account
                </p>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
                {globalError && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {globalError}
                    </div>
                )}

                <div className="grid gap-2">
                    <label htmlFor="email">Email</label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        className={errors.email ? "border-red-500" : ""}
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center">
                        <label htmlFor="password">Password</label>
                        <Link
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm underline"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        className={errors.password ? "border-red-500" : ""}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
                </Button>
            </form>

            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline">
                    Sign up
                </Link>
            </div>
        </div>
    )
}
