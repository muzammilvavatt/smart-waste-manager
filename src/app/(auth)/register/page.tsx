"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2 } from "lucide-react"
import { UserRole } from "@/types"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const { register: registerUser, isLoading, user, isInitialized } = useAuth()
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
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    if (!isInitialized || user) {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const onSubmit = async (data: RegisterFormValues) => {
        setGlobalError("")
        try {
            await registerUser(data.email, data.name, 'citizen', data.password)
            // Redirect handled by AuthContext (auto-login -> state update -> useEffect redirect)
        } catch (error: any) {
            console.error("Registration error:", error)
            setGlobalError(error.message || "Registration failed! Please try again.")
            toast.error("Registration failed")
        }
    }

    return (
        <div className="grid gap-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Create an Account</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your email below to create your account
                </p>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
                {globalError && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {globalError}
                    </div>
                )}

                <div className="grid gap-2">
                    <label htmlFor="name">Full Name</label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        className={errors.name ? "border-red-500" : ""}
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-500">{errors.name.message}</p>
                    )}
                </div>

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
                    <label htmlFor="password">Password</label>
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

                <div className="grid gap-2">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        required
                        className={errors.confirmPassword ? "border-red-500" : ""}
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
            </form>

            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Login
                </Link>
            </div>
        </div>
    )
}
