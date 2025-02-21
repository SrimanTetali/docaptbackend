import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: true,
    default: () => 'PAT' + Math.floor(100000 + Math.random() * 900000),
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  gender: { 
    type: String 
  },
  dob: { 
    type: Date 
  },
  profilePhoto: { 
    type: String, 
    default: "https://res.cloudinary.com/dagj68nid/image/upload/v1740113082/profile_rbgnjk.png" 
  },
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Patient', patientSchema);
