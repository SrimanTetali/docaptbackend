import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true, 
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true, 
    trim: true
  },
  address: {
    type: String,
    required: true, 
    trim: true
  },
  gender: { 
    type: String 
  },
  dob: { 
    type: Date,
    required: true 
  },
  age: { 
    type: Number,  // Manually entered by the user
    required: true 
  },
  bloodGroup: { 
    type: String, 
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] 
  },
  profilePhoto: { 
    type: String, 
    default: "https://res.cloudinary.com/dagj68nid/image/upload/v1740113082/profile_rbgnjk.png" 
  },
  role: { 
    type: String, 
    enum: ["Patient", "Doctor", "Admin"], 
    default: "Patient" 
  }, 
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
  ],
},{timestamps: true}); // Automatically adds createdAt & updatedAt

export default mongoose.model('Patient', patientSchema);
