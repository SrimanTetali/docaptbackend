import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
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
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  education: { 
    type: String,
    required: true, 
  },
  about:{
    type:String,
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
  consultingFee: { 
    type: Number, 
    default: 300, 
  },
  profilePhoto: { 
    type: String 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Doctor', doctorSchema);
