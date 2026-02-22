import mongoose from 'mongoose';

const resetTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expires: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

// Create a TTL index to automatically delete expired tokens
resetTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const ResetToken = mongoose.models.ResetToken || mongoose.model('ResetToken', resetTokenSchema);

export default ResetToken;
