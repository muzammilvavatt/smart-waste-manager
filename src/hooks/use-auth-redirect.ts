"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function useAuthRedirect() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === "citizen") {
                router.replace("/dashboard/citizen")
            } else if (user.role === "collector") {
                router.replace("/dashboard/collector")
            } else if (user.role === "admin") {
                router.replace("/dashboard/admin")
            }
        }
    }, [user, isLoading, router])
}
