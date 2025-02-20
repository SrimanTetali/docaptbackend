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
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'rejected'],
    default: 'pending', // Fixed case sensitivity issue
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
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
  cancellationReason: {  // Added cancellation reason
    type: String,
    default: '',
  },
  cancelledBy: {  // Identifies who canceled the appointment
    type: String,
    enum: ['patient', 'doctor', ''],
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Booking', bookingSchema);
