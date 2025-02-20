import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        unique: true,
        required: true,
        default: () => 'ADM' + Math.floor(100000 + Math.random() * 900000)
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['super-admin', 'admin'],
        default: 'admin'
    },
    permissions: [{
        type: String,
        enum: [
            'manage_patients',
            'manage_doctors',
            'manage_bookings',
            'view_analytics',
            'manage_settings'
        ]
    }],
    lastLogin: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
adminSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Admin', adminSchema);