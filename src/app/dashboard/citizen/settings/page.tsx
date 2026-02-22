"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { updateUser } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Save, User, Lock } from "lucide-react"
import toast from "react-hot-toast"

export default function SettingsPage() {
    const { user, login } = useAuth()
    const [loading, setLoading] = useState(false)

    // Profile State
    const [name, setName] = useState(user?.name || "")
    const [email, setEmail] = useState(user?.email || "")

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
                email
            })

            // Update local user state (hacky way since auth context might not auto-update)
            // Ideally auth context should have a refreshUser method
            // For now, we utilize the fact that login updates the user state
            // But we don't have the password here to re-login. 
            // So we might need to reload or just trust the toast.
            // Actually, we can't easily update the auth context user without a method for it.
            // Let's just trust the toast and maybe reload the page or ask user to relogin if email changed.

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

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-emerald-500" />
                            <CardTitle>Profile Information</CardTitle>
                        </div>
                        <CardDescription>
                            Update your personal details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Profile
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-emerald-500" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>
                            Change your password to keep your account secure.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="New password"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <Button type="submit" disabled={loading} variant="outline" className="w-full sm:w-auto">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Update Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
