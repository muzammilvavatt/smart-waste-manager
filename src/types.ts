export type UserRole = 'citizen' | 'collector' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    points?: number; // Only for citizens
    avatar?: string;
}

export interface WasteVerificationResult {
    category: 'organic' | 'plastic' | 'metal' | 'paper' | 'hazardous' | 'non_waste' | 'general' | 'verified' | 'rejected';
    confidence: number;
    message: string;
}

export interface CollectionTask {
    id: string;
    wasteType: string;
    amount: string; // e.g., "2 bags"
    location: string;
    coordinates?: { lat: number; lng: number };
    date: string;
    status: 'pending' | 'in-progress' | 'collected' | 'verified' | 'rejected';
    collectorId?: string | null;
    citizenId: string;
    imageUrl?: string;
    proofImage?: string; // photo by collector
    verificationResult?: {
        status: 'verified' | 'rejected';
        message: string;
        at: string;
    };
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    date: string;
}
