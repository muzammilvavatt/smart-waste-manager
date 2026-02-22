"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/shared/logo"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error('Something went wrong')

            setIsSubmitted(true)
            toast.success("Reset link sent if email exists!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to send reset link")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Forgot Password</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your email to receive a password reset link
                </p>
            </div>

            {isSubmitted ? (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Check your email</h3>
                            <div className="mt-2 text-sm text-green-700">
                                <p>If an account exists for that email, we have sent a password reset link.</p>
                            </div>
                            <div className="mt-4">
                                <Link href="/login" className="text-sm font-medium text-green-600 hover:text-green-500">
                                    Back to login &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
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

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
            )}

            {!isSubmitted && (
                <div className="mt-4 text-center text-sm">
                    <Link href="/login" className="underline">
                        Back to login
                    </Link>
                </div>
            )}
        </div>
    )
}
