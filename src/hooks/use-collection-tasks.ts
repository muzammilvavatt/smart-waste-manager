import { useState, useEffect, useMemo } from 'react';
import { CollectionTask } from '@/types';
import { getTasks, updateTaskStatus } from '@/lib/store';
import toast from 'react-hot-toast';
import { useNotifications } from '@/contexts/notification-context';
import useSWR from 'swr';

export function useCollectionTasks(user: { id: string } | null, scope: 'assigned' | 'all' = 'assigned') {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { addNotification } = useNotifications();

    const fetcher = async () => {
        if (!user) return [];
        const userId = scope === 'assigned' ? user.id : undefined;
        return getTasks("collector", userId);
    };

    const swrKey = user ? `tasks-collector-${scope}-${user?.id || 'all'}` : null;

    const { data: tasks = [], error, isLoading: loading, mutate } = useSWR<CollectionTask[]>(
        swrKey,
        fetcher,
        {
            revalidateOnFocus: false, // Don't constantly ping on focus
        }
    );

    const refreshTasks = () => mutate();

    const handleStatusUpdate = async (taskId: string, newStatus: CollectionTask['status'], proofImage?: string) => {
        try {
            // Optimistic update
            const updatedTasks = tasks.map(t =>
                t.id === taskId ? { ...t, status: newStatus, proofImage: proofImage || t.proofImage } : t
            );
            mutate(updatedTasks, false); // Update locally without revalidating instantly

            await updateTaskStatus(taskId, newStatus, user?.id, proofImage);
            await mutate(); // Revalidate with server
            return true;
        } catch (error) {
            console.error("Failed to update task", error);
            toast.error("Failed to update task status");
            await mutate(); // Revert optimistic update on error
            return false;
        }
    };

    const handleClaimTask = async (taskId: string) => {
        const success = await handleStatusUpdate(taskId, 'in-progress');
        if (success) {
            toast.success("Task claimed! Head to the location.");
            addNotification("success", "Task Claimed", "You have successfully claimed the waste collection task. Head to the location.");
        }
    };

    const handleVerifyTask = async (taskId: string, proofImage: string) => {
        // Logic handled in handleStatusUpdate but specific for verification
        const success = await handleStatusUpdate(taskId, 'collected', proofImage);
        if (success) {
            addNotification("success", "Collection Verified", "Waste collection verified and submitted for admin approval.");
        }
        return success;
    }

    // Stats calculation
    const stats = useMemo(() => {
        const totalCollections = tasks.filter(t => t.status === 'collected' || t.status === 'verified').length;
        const pendingCollections = tasks.filter(t => t.status === 'pending').length;
        const todayCollections = tasks.filter(t =>
            (t.status === 'collected' || t.status === 'verified') &&
            t.date === new Date().toISOString().split('T')[0]
        ).length;

        return { totalCollections, pendingCollections, todayCollections };
    }, [tasks]);

    // Filter logic
    const filteredTasks = useMemo(() => {
        let result = tasks;

        // 1. Text Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(task =>
                (task.location && task.location.toLowerCase().includes(lowerQuery)) ||
                (task.wasteType && task.wasteType.toLowerCase().includes(lowerQuery))
            );
        }

        // 2. Status Filter
        if (filter !== 'all') {
            if (filter === 'collected') {
                result = result.filter(task => task.status === 'collected' || task.status === 'verified');
            } else {
                result = result.filter(task => task.status === filter);
            }
        }

        // 3. Sort: Pending first, then by date (newest first)
        return result.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [tasks, filter, searchQuery]);


    return {
        tasks,
        loading,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        filteredTasks,
        stats,
        refreshTasks,
        updateTaskStatus: handleStatusUpdate,
        claimTask: handleClaimTask,
        verifyTask: handleVerifyTask
    };
}
