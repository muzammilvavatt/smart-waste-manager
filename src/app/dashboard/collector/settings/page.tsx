"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { updateUser } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { AvatarSelector } from "@/components/shared/avatar-selector"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const { user, logout, refetchUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "appearance">("profile")

    // Profile State
    const [name, setName] = useState(user?.name || "")
    const [email, setEmail] = useState(user?.email || "")
    const [profileImage, setProfileImage] = useState(user?.profileImage || "")

    // Password State
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        setIsMounted(true)
        if (user) {
            setName(user.name || "")
            setEmail(user.email || "")
            setProfileImage(user.profileImage || "")
        }
    }, [user])

    if (!isMounted) return null

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

    const navItems = [
        { id: "profile", label: "Profile" },
        { id: "security", label: "Security" },
        { id: "appearance", label: "Appearance" },
    ] as const

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground text-sm">
                    Manage your account settings and set your preferences.
                </p>
            </div>

            <div className="shrink-0 bg-border h-[1px] w-full" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="lg:w-1/5 overflow-x-auto">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 justify-start",
                                    activeTab === item.id
                                        ? "bg-muted hover:bg-muted"
                                        : "hover:bg-transparent hover:underline text-muted-foreground"
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 lg:max-w-2xl">
                    {activeTab === "profile" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-xl font-medium tracking-tight">Profile Information</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Manage your personal information and how it is displayed.
                                </p>
                            </div>
                            <div className="shrink-0 bg-border h-[1px] w-full" />

                            <form onSubmit={handleProfileUpdate} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="pt-2 pb-4">
                                        <AvatarSelector
                                            currentAvatarId={profileImage}
                                            onAvatarSelect={(id) => setProfileImage(id)}
                                        />
                                    </div>

                                    <div className="grid gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="font-medium">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your Full Name"
                                                className="max-w-md h-10 transition-colors focus-visible:ring-emerald-500/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="font-medium">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your.email@example.com"
                                                className="max-w-md h-10 transition-colors focus-visible:ring-emerald-500/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="font-medium">Account Role</Label>
                                            <Input
                                                id="role"
                                                value={user?.role || ""}
                                                disabled
                                                className="max-w-md h-10 bg-muted/60 text-muted-foreground capitalize font-medium cursor-not-allowed"
                                            />
                                            <p className="text-xs text-muted-foreground">Your role is determined by your account type and cannot be changed here.</p>
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-10 px-6">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </form>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-lg font-medium">Security</h3>
                                <p className="text-sm text-muted-foreground">
                                    Update your password and secure your account.
                                </p>
                            </div>
                            <div className="shrink-0 bg-border h-[1px] w-full" />

                            <form onSubmit={handlePasswordUpdate} className="space-y-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="max-w-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="max-w-md"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update password
                                </Button>

                                <div className="pt-8 border-t border-border mt-8 space-y-4">
                                    <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={logout}
                                        className="w-auto"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign out of account
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-lg font-medium">Appearance</h3>
                                <p className="text-sm text-muted-foreground">
                                    Customize the appearance of the application.
                                </p>
                            </div>
                            <div className="shrink-0 bg-border h-[1px] w-full" />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Theme toggler</Label>
                                    <p className="text-[13px] text-muted-foreground">
                                        Switch between light and dark themes.
                                    </p>
                                    <div className="pt-2">
                                        <ThemeToggle variant="switch" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
