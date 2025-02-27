import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';
import Doctor from '../models/Doctor.js';

// **Register Doctor**
export const registerDoctor = async (req, res) => {
  const { name, email, password, phone,gender, specialization, education, experience } = req.body;
  try {
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }
    if (!name || !email || !password || !phone || !gender || !specialization || !education || !experience) {
      return res.status(400).json({ message: "All fields are required" });
  }  

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      specialization,
      education,
      experience,
    });
    await doctor.save();

    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (error) {
    console.error("Doctor Registration Error:", error); // Log the actual error
    res.status(500).json({ message: "Server error", error: error.message });
}

};

// **Login Doctor**

export const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  try {
    const lowerCaseEmail = email.toLowerCase(); // Ensure case-insensitive email matching
    const doctor = await Doctor.findOne({ email: lowerCaseEmail });

    if (!doctor) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { doctorId: doctor._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const responsePayload = {
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
      },
    };

    console.log("Doctor Login Response:", JSON.stringify(responsePayload, null, 2)); // Log response
    res.json(responsePayload);
  } catch (error) {
    console.error("Doctor Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.auth.id).select('-password'); // ✅ Corrected field
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error); // ✅ Added logging
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Doctor Profile
export const updateDoctorProfile = async (req, res) => {
  const { name, email, phone,gender, specialization, education, experience, about, consultingFee, profilePhoto, timeSlots } = req.body;

  try {
    const doctor = await Doctor.findById(req.auth.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update only if new values are provided
    doctor.name = name || doctor.name;
    doctor.email = email || doctor.email;
    doctor.phone = phone || doctor.phone;
    doctor.gender = gender || doctor.gender;
    doctor.specialization = specialization || doctor.specialization;
    doctor.education = education || doctor.education;
    doctor.experience = experience || doctor.experience;
    doctor.about = about || doctor.about;
    doctor.consultingFee = consultingFee || doctor.consultingFee;
    doctor.profilePhoto = profilePhoto || doctor.profilePhoto;
    doctor.timeSlots = timeSlots || doctor.timeSlots;

    await doctor.save();
    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    console.error('Error updating Doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// **Get Doctor Bookings (Fixed)**
export const getDoctorBookings = async (req, res) => {
  try {
    console.log("Fetching doctor bookings for:", req.auth);

    if (!req.auth || !req.auth.id) {
      return res.status(400).json({ message: "Doctor ID missing" });
    }

    const doctorId = req.auth.id;

    const bookings = await Booking.find({ doctorId })
      .populate("patientId", "name email phone") // ✅ Select only necessary patient fields
      .populate("doctorId", "name email specialization")
      .exec();

    console.log("Bookings found:", bookings);

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching doctor bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// **Update Booking Status**
export const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  const validStatuses = ['Pending', 'Accepted', 'Completed', 'Cancelled', 'Rejected'];

  try {
    console.log("Updating booking status for bookingId:", bookingId);

    // Validate status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure only the assigned user can update
    if (booking.doctorId.toString() !== req.auth.id) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own bookings" });
    }

    // Prevent reverting completed bookings
    if (booking.status === "Completed" && status !== "Completed") {
      return res.status(400).json({ message: "Cannot revert a completed booking" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated successfully", updatedBooking: booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error" });
  }
};


import mongoose from "mongoose";

export const cancelAppointmentByDoctor = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    // Validate bookingId format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    // Find the appointment
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure only the assigned doctor can cancel
    if (booking.doctorId.toString() !== req.auth.id) {
      return res.status(403).json({ message: "Unauthorized: You can only cancel your own appointments" });
    }

    // Prevent re-canceling
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    // Only allow cancellation if status is "pending" or "accepted"
    if (!["pending", "accepted"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this appointment" });
    }

    // Validate reason
    const cancellationReason = reason && typeof reason === "string" && reason.trim() !== "" 
      ? reason.trim() 
      : "No reason provided";

    // Update appointment status and reason
    booking.status = "cancelled";
    booking.cancellationReason = cancellationReason;
    booking.cancelledBy = "doctor";
    await booking.save();

    res.json({ 
      message: "Appointment cancelled successfully by the doctor", 
      updatedAppointment: booking 
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
