import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(),
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
  hospitalName: {
    type: String,
    required: true,
    default: '', 
  },
  hospitalAddress: {
    type: String,
    required: true,
    default: '', 
  },
  phone: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  gender: { 
    type: String,
    required: true,
  },
  education: { 
    type: String,
    required: true, 
  },
  about: {
    type: String,
    default: "Experienced medical professional providing quality healthcare.",
  },
  availability: {
    type: [
      {
        date: { type: Date, required: true },
        timeSlots: { 
          type: [String], 
          default: [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
            "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
          ] 
        }
      }
    ],
    default: []
  },
  timeSlots: { 
    type: [String], 
    default: [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
      "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
    ] 
  },
  consultingFee: { 
    type: Number, 
    default: 300, 
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
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);