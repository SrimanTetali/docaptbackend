import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';
import Doctor from '../models/Doctor.js';
import { sendEmail } from "../config/emailService.js";  // ✅ Correct
import mongoose from "mongoose";

// **Register Doctor**
export const registerDoctor = async (req, res) => {
  const { name, email, password, phone, gender, specialization, education, experience, hospitalName,hospitalAddress } = req.body;
  try {
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }
    if (!name || !email || !password || !phone || !gender || !specialization || !education || !experience || !hospitalName || !hospitalAddress) {
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
      hospitalName,
      hospitalAddress,
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
  const { name, email, phone, gender, specialization, education, experience, about, consultingFee, profilePhoto, timeSlots, hospitalName, hospitalAddress } = req.body;

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
    doctor.hospitalName = hospitalName || doctor.hospitalName;
    doctor.hospitalAddress = hospitalAddress || doctor.hospitalAddress;

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
  const validStatuses = ["Pending", "Accepted", "Completed", "Cancelled", "Rejected"];

  try {
    console.log("Updating booking status for bookingId:", bookingId);

    // Validate status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("patientId", "email name")
      .populate("doctorId", "email name");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Prevent reverting completed bookings
    if (booking.status === "Completed") {
      return res.status(400).json({ message: "Cannot revert a completed booking" });
    }

    booking.status = status;
    await booking.save();

    // Send email to patient
    const patientEmail = booking.patientId.email;
    const patientName = booking.patientId.name;
    const doctorName = booking.doctorId.name;

    let subject = "";
    let message = "";

    if (status === "Accepted") {
      subject = "Your Appointment has been Accepted!";
      message = `Dear ${patientName},\n\nYour appointment with ${doctorName} has been accepted.\n\nBest Regards,\neDocapt Team`;
    } else if (status === "Rejected") {
      subject = "Your Appointment has been Rejected";
      message = `Dear ${patientName},\n\nUnfortunately, ${doctorName} has rejected your appointment request.\n\nBest Regards,\neDocapt Team`;
    }

    if (subject && message) {
      sendEmail(patientEmail, subject, message);
    }

    res.json({ message: "Booking status updated successfully", updatedBooking: booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const cancelAppointmentByDoctor = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("patientId", "email name")
      .populate("doctorId", "email name");
    if (!booking) {
      return res.status(404).json({ message: "Appointment not found" });
    }


    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    if (!["Pending", "Accepted"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this appointment" });
    }

    const cancellationReason = reason && typeof reason === "string" && reason.trim() !== ""
      ? reason.trim()
      : "No reason provided";

    booking.status = "Cancelled";
    booking.cancellationReason = cancellationReason;
    booking.cancelledBy = "doctor";
    await booking.save();

    // Send cancellation email
    const patientEmail = booking.patientId.email;
    const patientName = booking.patientId.name;
    const doctorName = booking.doctorId.name;

    const subject = "Your Appointment has been Cancelled";
    const message = `Dear ${patientName},\n\nYour appointment with ${doctorName} has been cancelled.\nReason: ${cancellationReason}\n\nBest Regards,\neDocapt Team`;

    sendEmail(patientEmail, subject, message);

    res.json({
      message: "Appointment cancelled successfully by the doctor",
      updatedAppointment: booking
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
