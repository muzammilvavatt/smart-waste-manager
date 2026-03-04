"use client"

import { useEffect, useState } from "react"
import { getAllUsers, deleteUser, updateUser, createAdminUser } from "@/lib/store"
import { User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash, Edit, X, Check, Plus, AlertTriangle, Search, Filter, User as UserIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserAvatar } from "@/components/shared/user-avatar"
import { motion } from "framer-motion"
import useSWR from 'swr'

import toast from "react-hot-toast"

export default function UsersPage() {
    const [loading, setLoading] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [editRole, setEditRole] = useState<User['role']>('citizen')
    const [editPoints, setEditPoints] = useState<number>(0)
    const [editName, setEditName] = useState<string>('')
    const [editEmail, setEditEmail] = useState<string>('')
    const [editPassword, setEditPassword] = useState<string>('')
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null)
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'citizen' as User['role'], password: '' })

    // Filtering State
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<User['role'] | 'all'>('all')

    const fetcher = async () => {
        const data = await getAllUsers();
        return Array.isArray(data) ? data : [];
    };

    const { data: users = [], isLoading: isFetching, mutate } = useSWR<User[]>(
        'admin-users',
        fetcher,
        { revalidateOnFocus: false }
    );

    const loadUsers = async () => {
        await mutate();
    }

    const handleDeleteClick = (userId: string, userName: string) => {
        setUserToDelete({ id: userId, name: userName })
    }

    const confirmDelete = async () => {
        if (!userToDelete) return

        setLoading(true)
        try {
            await deleteUser(userToDelete.id)
            await loadUsers()
            toast.success('User deleted successfully')
            setUserToDelete(null)
        } catch (error) {
            toast.error('Failed to delete user. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleEditStart = (user: User) => {
        setEditingUser(user)
        setEditRole(user.role)
        setEditPoints(user.points || 0)
        setEditName(user.name)
        setEditEmail(user.email)
        setEditPassword('')
    }

    const handleEditSave = async () => {
        if (!editingUser) return

        setLoading(true)
        try {
            await updateUser(editingUser.id, {
                role: editRole,
                points: editPoints,
                name: editName,
                email: editEmail,
                ...(editPassword ? { password: editPassword } : {})
            })
            await loadUsers()
            setEditingUser(null)
            toast.success('User updated successfully')
        } catch (error) {
            toast.error('Failed to update user. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleEditCancel = () => {
        setEditingUser(null)
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createAdminUser(newUser.email, newUser.name, newUser.role, newUser.password)
            await loadUsers()
            setIsAddUserOpen(false)
            setNewUser({ name: '', email: '', role: 'citizen', password: '' })
            toast.success('User added successfully')
        } catch (error) {
            toast.error('Failed to add user. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    })

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">User Management</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-[250px] pl-9 pr-4 py-2 text-sm border border-border/50 rounded-lg bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <div className="relative flex-shrink-0">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="w-full sm:w-auto pl-9 pr-8 py-2 text-sm border border-border/50 rounded-lg bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer capitalize"
                        >
                            <option value="all">All Roles</option>
                            <option value="citizen">Citizen</option>
                            <option value="collector">Collector</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <Button onClick={() => setIsAddUserOpen(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredUsers.map((user, index) => {
                    const isEditing = editingUser?.id === user.id;

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                            key={user.id}
                            className={`relative flex flex-col bg-card/60 backdrop-blur-md rounded-xl border border-border/40 shadow-sm overflow-hidden transition-all duration-200
                                ${isEditing ? 'ring-2 ring-emerald-500/50 bg-card/80' : 'hover:shadow-md hover:border-emerald-500/20 hover:-translate-y-1 hover:bg-card/80'}
                            `}
                        >
                            {/* Role Indicator Edge */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${user.role === 'admin' ? 'bg-purple-500' :
                                user.role === 'collector' ? 'bg-blue-500' : 'bg-green-500'
                                }`} />

                            <div className="p-5 pl-6 flex flex-col h-full space-y-4">
                                {/* Header: Avatar & Actions */}
                                <div className="flex items-start justify-between">
                                    <UserAvatar
                                        avatarId={user.profileImage}
                                        fallbackName={user.name}
                                        className="h-10 w-10 shrink-0 rounded-full"
                                    />

                                    {!isEditing && (
                                        <div className="flex items-center gap-1 -mr-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-emerald-600 transition-colors"
                                                onClick={() => handleEditStart(user)}
                                                disabled={loading}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                onClick={() => handleDeleteClick(user.id, user.name)}
                                                disabled={loading}
                                            >
                                                <Trash className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Content Body */}
                                <div className="flex-1 space-y-3">
                                    {isEditing ? (
                                        <div className="space-y-3 pt-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
                                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                                                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-sm" />
                                            </div>
                                            <div className={`grid ${editRole === 'citizen' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
                                                    <select
                                                        value={editRole}
                                                        onChange={(e) => setEditRole(e.target.value as User['role'])}
                                                        className="w-full h-8 px-2 text-sm rounded-md border border-input bg-background/50 backdrop-blur-sm"
                                                    >
                                                        <option value="citizen">Citizen</option>
                                                        <option value="collector">Collector</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                {editRole === 'citizen' && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Points</label>
                                                        <Input type="number" value={editPoints} onChange={(e) => setEditPoints(parseInt(e.target.value) || 0)} className="h-8 text-sm" min="0" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">New Password (Optional)</label>
                                                <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="••••••••" className="h-8 text-sm" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="font-semibold text-foreground truncate text-lg tracking-tight mb-0.5" title={user.name}>
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground truncate" title={user.email}>
                                                {user.email}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer / Badges & Save Actions */}
                                <div className="pt-3 mt-auto border-t border-border/40 flex items-center justify-between">
                                    {isEditing ? (
                                        <div className="flex gap-2 w-full justify-end">
                                            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" onClick={handleEditCancel} disabled={loading}>
                                                Cancel
                                            </Button>
                                            <Button size="sm" className="h-8 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleEditSave} disabled={loading}>
                                                <Check className="mr-1 h-3.5 w-3.5" /> Save
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${user.role === 'admin' ? 'bg-purple-100/50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' :
                                                user.role === 'collector' ? 'bg-blue-100/50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                                    'bg-green-100/50 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                }`}>
                                                {user.role}
                                            </span>

                                            {user.role === 'citizen' && (
                                                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                                    <span>{user.points || 0}</span> Pts
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {filteredUsers.length === 0 && !isFetching && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/40 rounded-xl bg-card/40 backdrop-blur-sm">
                        <div className="p-4 bg-muted/50 rounded-full mb-4">
                            <UserIcon className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">No users found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            We couldn't find any users matching your search criteria. Try adjusting your filters.
                        </p>
                    </div>
                )}
            </div>
            {
                isAddUserOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        {/* ... existing Add User modal ... */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg border dark:border-gray-800">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-50">Add New User</h2>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                                    <Input
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                                    <Input
                                        type="email"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                                        className="w-full px-3 py-2 rounded-md border text-sm dark:bg-gray-950 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="citizen">Citizen</option>
                                        <option value="collector">Collector</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
                                    <Input
                                        type="password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        placeholder="********"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setIsAddUserOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                                        {loading ? 'Adding...' : 'Add User'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {
                userToDelete && (
                    <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-5 w-5" /> Confirm Deletion
                                </DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete user <strong>"{userToDelete.name}"</strong>? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="ghost" onClick={() => setUserToDelete(null)} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
                                    {loading ? 'Deleting...' : 'Delete User'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )
            }
        </div>
    )
}

