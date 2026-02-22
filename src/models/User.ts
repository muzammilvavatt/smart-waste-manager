import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
    email: string;
    name: string;
    role: 'citizen' | 'collector' | 'admin';
    points?: number;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['citizen', 'collector', 'admin'],
            required: [true, 'Role is required'],
        },
        points: {
            type: Number,
            default: 0,
            min: 0,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false, // Don't return password by default
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const User = models.User || model<IUser>('User', UserSchema);

export default User;
