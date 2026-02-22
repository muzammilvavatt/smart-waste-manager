"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/shared/logo"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams, useRouter } from "next/navigation"

const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    if (!token) {
        return (
            <div className="text-center text-red-600">
                Invalid or missing reset token. Please request a new link.
            </div>
        )
    }

    const onSubmit = async (data: ResetPasswordFormValues) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: data.password }),
            })

            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Something went wrong')

            setIsSuccess(true)
            toast.success("Password reset successfully!")

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/login')
            }, 2000)

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to reset password")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="rounded-md bg-green-50 p-4 border border-green-200 text-center">
                <h3 className="text-lg font-medium text-green-800">Password Reset Complete!</h3>
                <p className="mt-2 text-sm text-green-700">
                    Your password has been updated. Redirecting to login...
                </p>
                <div className="mt-4">
                    <Link href="/login" className="text-sm font-medium text-green-600 hover:text-green-500">
                        Click here if not redirected
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="password" className="sr-only">
                        New Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="New Password"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.password ? "border-red-500 ring-red-500" : ""}`}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                        Confirm New Password
                    </label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm New Password"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.confirmPassword ? "border-red-500 ring-red-500" : ""}`}
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                </div>
            </div>

            <div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
            </div>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="grid gap-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Set new password</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your new password below
                </p>
            </div>

            <Suspense fallback={<div>Loading form...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
