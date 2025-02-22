import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  urgency: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Completed', 'Cancelled', 'Rejected'],
    default: 'Pending', // Ensure case matches
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  paymentMethod: { 
    type: String, 
    enum: ['online', 'cash'], 
    default: 'cash' 
  },
  reason: { 
    type: String,
    default: 'Regular checkup',
  },
  cancellationReason: { 
    type: String,
    default: '',
  },
  cancelledBy: {  
    type: String,
    enum: ['patient', 'doctor', null],  // Allow null values
    default: null, // Fix: Empty string is not a valid enum value
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Booking', bookingSchema);
