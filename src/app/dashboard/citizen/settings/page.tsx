"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { updateUser } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Save, User, Lock, LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { AvatarSelector } from "@/components/shared/avatar-selector"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Moon } from "lucide-react"

export default function SettingsPage() {
    const { user, login, logout, refetchUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    // Profile State
    const [name, setName] = useState(user?.name || "")
    const [email, setEmail] = useState(user?.email || "")
    const [profileImage, setProfileImage] = useState(user?.profileImage || "")

    useEffect(() => {
        setIsMounted(true)
        if (user) {
            setName(user.name || "")
            setEmail(user.email || "")
            setProfileImage(user.profileImage || "")
        }
    }, [user])

    // Password State
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const updatedUser = await updateUser(user.id, {
                name,
                email,
                profileImage: profileImage || undefined
            })

            await refetchUser({
                name: updatedUser.name,
                email: updatedUser.email,
                profileImage: updatedUser.profileImage
            })

            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error("Failed to update profile")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            await updateUser(user.id, {
                password
            })
            setPassword("")
            setConfirmPassword("")
            toast.success("Password updated successfully")
        } catch (error) {
            toast.error("Failed to update password")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!isMounted) {
        return null;
    }

    return (
        <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto pb-24 sm:pb-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1.5 pb-4 border-b border-border/40">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-[13px] sm:text-base text-muted-foreground mt-1 font-medium">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6 sm:gap-8">
                <Card className="rounded-[1.5rem] bg-transparent sm:bg-card border-none sm:border-solid shadow-none sm:shadow-sm">
                    <CardHeader className="p-0 sm:p-6 pb-4 sm:pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl shrink-0">
                                <User className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl tracking-tight">Profile Information</CardTitle>
                                <CardDescription className="text-[13px] sm:text-sm mt-0.5">
                                    Update your personal details.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-5">
                            <div className="flex justify-center mb-10 w-full">
                                <AvatarSelector
                                    currentAvatarId={profileImage}
                                    onAvatarSelect={(id) => setProfileImage(id)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-sm font-bold px-1">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="h-12 sm:h-10 rounded-xl sm:rounded-md bg-white dark:bg-zinc-900 border-border/60 font-medium shadow-sm focus:ring-emerald-500/20"
                                />
                            </div>
                            <div className="grid gap-2 pt-1 sm:pt-0">
                                <Label htmlFor="email" className="text-sm font-bold px-1">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="h-12 sm:h-10 rounded-xl sm:rounded-md bg-white dark:bg-zinc-900 border-border/60 font-medium shadow-sm focus:ring-emerald-500/20"
                                />
                            </div>
                            <div className="pt-2 sm:pt-0">
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto h-12 sm:h-10 rounded-xl sm:rounded-md font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.98]">
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    Save Profile
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-[1.5rem] bg-transparent sm:bg-card border-none sm:border-solid shadow-none sm:shadow-sm">
                    <CardHeader className="p-0 sm:p-6 pb-4 sm:pb-6 pt-0 sm:pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 rounded-2xl shrink-0">
                                <Lock className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl tracking-tight">Security</CardTitle>
                                <CardDescription className="text-[13px] sm:text-sm mt-0.5">
                                    Change your password to keep your account secure.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 sm:space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-sm font-bold px-1">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="New password"
                                    className="h-12 sm:h-10 rounded-xl sm:rounded-md bg-white dark:bg-zinc-900 border-border/60 font-medium shadow-sm focus:ring-emerald-500/20"
                                />
                            </div>
                            <div className="grid gap-2 pt-1 sm:pt-0">
                                <Label htmlFor="confirm-password" className="text-sm font-bold px-1">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="h-12 sm:h-10 rounded-xl sm:rounded-md bg-white dark:bg-zinc-900 border-border/60 font-medium shadow-sm focus:ring-emerald-500/20"
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" disabled={loading} variant="outline" className="w-full sm:w-auto h-12 sm:h-10 rounded-xl sm:rounded-md font-bold shadow-sm active:scale-[0.98] transition-all border-border/60 bg-white dark:bg-zinc-900">
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-[1.5rem] bg-transparent sm:bg-card border-none sm:border-solid shadow-none sm:shadow-sm">
                    <CardHeader className="p-0 sm:p-6 pb-4 sm:pb-6 pt-0 sm:pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-2xl shrink-0">
                                <Moon className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl tracking-tight">Appearance</CardTitle>
                                <CardDescription className="text-[13px] sm:text-sm mt-0.5">
                                    Customize how the application looks for you.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <div className="flex items-center justify-between py-2 sm:p-0">
                            <Label className="text-sm font-bold px-1">Theme Toggle</Label>
                            <ThemeToggle variant="switch" />
                        </div>
                    </CardContent>
                </Card>

                {/* Minimalist Sign Out Button */}
                <div className="flex justify-center mt-8 sm:mt-12">
                    <Button
                        onClick={logout}
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full px-6 h-12 font-semibold transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out of Account
                    </Button>
                </div>
            </div>
        </div>
    )
}
