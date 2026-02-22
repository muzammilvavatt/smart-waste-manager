"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, UserRole } from "@/types"
import { createUser } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isInitialized: boolean
    login: (email: string, password?: string) => Promise<void>
    register: (email: string, name: string, role: UserRole, password?: string) => Promise<void>
    logout: () => void
    refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isInitialized: false,
    login: async () => { },
    register: async () => { },
    logout: () => { },
    refetchUser: async () => { },
})

export function useAuth() {
    return useContext(AuthContext)
}

interface AuthProviderProps {
    children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { data: session, status, update } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    const isLoading = status === "loading"
    const isInitialized = status !== "loading"

    useEffect(() => {
        if (session?.user) {
            setUser({
                id: session.user.id || "",
                name: session.user.name || "",
                email: session.user.email || "",
                role: (session.user as any).role || "citizen",
                points: (session.user as any).points || 0
            })
        } else {
            setUser(null)
        }
    }, [session])

    const login = async (email: string, password?: string) => {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false
        })

        if (result?.error) {
            throw new Error(result.error)
        }

        // Redirect handled by component or effect
        // But for compatibility with existing code, let's look at the session update
    }

    const register = async (email: string, name: string, role: UserRole, password?: string) => {
        // 1. Create user in DB
        await createUser(email, name, role, password)

        // 2. Auto-login
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false
        })

        if (result?.error) {
            throw new Error("Registration successful but auto-login failed: " + result.error)
        }
    }

    const logout = async () => {
        await signOut({ redirect: true, callbackUrl: "/" })
    }

    const refetchUser = async () => {
        await update()
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, isInitialized, login, register, logout, refetchUser }}>
            {children}
        </AuthContext.Provider>
    )
}

