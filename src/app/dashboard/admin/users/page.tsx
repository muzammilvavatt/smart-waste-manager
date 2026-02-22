"use client"

import { useEffect, useState } from "react"
import { getAllUsers, deleteUser, updateUser, createAdminUser } from "@/lib/store"
import { User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash, Edit, X, Check, Plus, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import toast from "react-hot-toast"

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
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

    const loadUsers = async () => {
        const data = await getAllUsers()
        setUsers(data)
    }

    useEffect(() => {
        loadUsers()
    }, [])

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">User Management</h1>
                <Button onClick={() => setIsAddUserOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Points</th>
                                    <th className="px-6 py-3">Password (Reset)</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b bg-white dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {editingUser?.id === user.id ? (
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-32"
                                                />
                                            ) : (
                                                user.name
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser?.id === user.id ? (
                                                <Input
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                    className="w-48"
                                                />
                                            ) : (
                                                user.email
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser?.id === user.id ? (
                                                <select
                                                    value={editRole}
                                                    onChange={(e) => setEditRole(e.target.value as User['role'])}
                                                    className="px-2 py-1 rounded border dark:bg-gray-800 dark:border-gray-700"
                                                >
                                                    <option value="citizen">Citizen</option>
                                                    <option value="collector">Collector</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'citizen' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                    user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser?.id === user.id ? (
                                                <Input
                                                    type="number"
                                                    value={editPoints}
                                                    onChange={(e) => setEditPoints(parseInt(e.target.value) || 0)}
                                                    className="w-24"
                                                    min="0"
                                                />
                                            ) : (
                                                user.points || '-'
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser?.id === user.id ? (
                                                <Input
                                                    type="password"
                                                    value={editPassword}
                                                    onChange={(e) => setEditPassword(e.target.value)}
                                                    placeholder="New Password"
                                                    className="w-32"
                                                />
                                            ) : (
                                                <span className="text-gray-400">••••••••</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser?.id === user.id ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700"
                                                        onClick={handleEditSave}
                                                        disabled={loading}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={handleEditCancel}
                                                        disabled={loading}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEditStart(user)}
                                                        disabled={loading}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                        onClick={() => handleDeleteClick(user.id, user.name)}
                                                        disabled={loading}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            {isAddUserOpen && (
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
            )}
            {userToDelete && (
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
            )}
        </div>
    )
}

