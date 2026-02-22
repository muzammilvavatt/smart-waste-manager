import mongoose, { Schema, model, models } from 'mongoose';

export interface ITask {
    wasteType: string;
    amount: string;
    location: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    date: string;
    status: 'pending' | 'in-progress' | 'collected' | 'verified' | 'rejected';
    citizenId: string;
    collectorId?: string;
    imageUrl?: string;
    proofImage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        wasteType: {
            type: String,
            required: [true, 'Waste type is required'],
            trim: true,
        },
        amount: {
            type: String,
            required: [true, 'Amount is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        coordinates: {
            lat: {
                type: Number,
                required: false,
            },
            lng: {
                type: Number,
                required: false,
            },
        },
        date: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'collected', 'verified', 'rejected'],
            default: 'pending',
        },
        citizenId: {
            type: String,
            required: [true, 'Citizen ID is required'],
            ref: 'User',
        },
        collectorId: {
            type: String,
            ref: 'User',
        },
        imageUrl: {
            type: String,
            default: '/placeholder-waste.jpg',
        },
        proofImage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
TaskSchema.index({ citizenId: 1, status: 1 });
TaskSchema.index({ collectorId: 1, status: 1 });
TaskSchema.index({ status: 1, date: -1 }); // Added for faster admin dashboard queries
TaskSchema.index({ status: 1, createdAt: -1 }); // Added for collector pending tasks
TaskSchema.index({ collectorId: 1, createdAt: -1 }); // Added for collector assigned tasks

// Prevent model recompilation in development
const Task = models.Task || model<ITask>('Task', TaskSchema);

export default Task;
