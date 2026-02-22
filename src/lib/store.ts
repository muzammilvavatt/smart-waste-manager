// This file handles all data operations via API routes connected to MongoDB
import { User, CollectionTask } from '@/types';

// Helper to simulate delay for better UX (disabled for speed)
const delay = (ms: number) => Promise.resolve();

/**
 * Simulates user login by verifying email against the backend.
 * @param email - User's email address
 * @param password - User's password
 * @returns User object if found, null otherwise
 */
export async function loginUser(email: string, password?: string): Promise<User | null> {
    await delay(300);
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            if (response.status === 404 || response.status === 401) return null;
            throw new Error('Login failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

/**
 * Registers a new citizen (Public Registration).
 * Forces role to 'citizen' via backend.
 * @param email - User email
 * @param name - User full name
 * @param password - User password
 * @param role - Role (ignored by backend, kept for compatibility interface)
 */
export async function createUser(email: string, name: string, role: User['role'], password?: string): Promise<User> {
    await delay(300);
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, role, password }), // Role is now ignored by public API
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Creates a new user with any role (Admin Dashboard only).
 * @param email - User email
 * @param name - User full name
 * @param role - Role (citizen, collector, admin)
 * @param password - User password
 */
export async function createAdminUser(email: string, name: string, role: User['role'], password?: string): Promise<User> {
    await delay(300);
    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, role, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Admin user creation failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Admin create user error:', error);
        throw error;
    }
}

/**
 * Fetches collection tasks, optionally filtered by role or user.
 * @param role - The requesting user's role
 * @param userId - Optional ID to filter tasks specific to a user
 */
export async function getTasks(role: User['role'], userId?: string): Promise<CollectionTask[]> {
    await delay(300);
    try {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (userId) params.append('userId', userId);

        const response = await fetch(`/api/tasks?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        return await response.json();
    } catch (error) {
        console.error('Get tasks error:', error);
        return [];
    }
}

export async function updateTaskStatus(
    taskId: string,
    status: CollectionTask['status'],
    collectorId?: string,
    proofImage?: string
): Promise<CollectionTask> {
    await delay(300);
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, collectorId, proofImage }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Update failed: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to update task: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Update task error:', error);
        throw error;
    }
}

export async function createTask(
    wasteType: string,
    amount: string,
    location: string,
    coordinates: { lat: number; lng: number } | undefined,
    citizenId: string,
    imageUrl?: string
): Promise<CollectionTask> {
    await delay(300);
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wasteType,
                amount,
                location,
                coordinates,
                citizenId,
                imageUrl,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create task');
        }

        return await response.json();
    } catch (error) {
        console.error('Create task error:', error);
        throw error;
    }
}

export async function getAllUsers(): Promise<User[]> {
    await delay(300);
    try {
        const response = await fetch('/api/users');

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        return await response.json();
    } catch (error) {
        console.error('Get users error:', error);
        return [];
    }
}

export async function deleteUser(userId: string): Promise<void> {
    await delay(300);
    try {
        const response = await fetch(`/api/users?id=${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        console.error('Delete user error:', error);
        throw error;
    }
}

export async function updateUser(
    userId: string,
    updates: { role?: User['role']; points?: number; name?: string; email?: string; password?: string }
): Promise<User> {
    await delay(300);
    try {
        const response = await fetch('/api/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, ...updates }),
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        return await response.json();
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
}

