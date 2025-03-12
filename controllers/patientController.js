import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import mongoose from 'mongoose';

// Register Patient
export const registerPatient = async (req, res) => {
  const { name, email, password, phone, address, gender, dob, age, bloodGroup } = req.body;

  try {
    const lowerCaseEmail = email.toLowerCase(); // Ensure case-insensitive email uniqueness
    const patientExists = await Patient.findOne({ email: lowerCaseEmail });

    if (patientExists) {
      return res.status(400).json({ message: "Patient already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = new Patient({
      name,
      email: lowerCaseEmail,
      password: hashedPassword,
      phone,
      address,
      gender,
      dob,
      age, // Added age field
      bloodGroup, // Added bloodGroup field
    });

    await patient.save();

    res.status(201).json({ message: "Patient registered successfully", patientId: patient._id });
  } catch (error) {
    console.error("Error in registerPatient:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Login Patient
export const loginPatient = async (req, res) => {
  const { email, password } = req.body;
  try {
    const lowerCaseEmail = email.toLowerCase(); // Ensure case-insensitive email matching
    const patient = await Patient.findOne({ email: lowerCaseEmail });

    if (!patient) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ patientId: patient._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    const responsePayload = {
      token,
      patient: { id: patient._id, name: patient.name, email: patient.email, phone: patient.phone },
    };

    console.log("Login response:", JSON.stringify(responsePayload, null, 2)); // Log response
    res.json(responsePayload);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// Get Patient Profile
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.auth.id).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Update Patient Profile
export const updatePatientProfile = async (req, res) => {
  const { name, email, phone, address, gender, dob, profilePhoto, age, bloodGroup } = req.body;

  try {
    const patient = await Patient.findById(req.auth.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update only if new values are provided
    patient.name = name || patient.name;
    patient.email = email.toLowerCase() || patient.email;
    patient.phone = phone || patient.phone;
    patient.address = address || patient.address;
    patient.gender = gender || patient.gender;
    patient.dob = dob || patient.dob;
    patient.profilePhoto = profilePhoto || patient.profilePhoto;
    patient.age = age || patient.age;
    patient.bloodGroup = bloodGroup || patient.bloodGroup;

    await patient.save();
    res.json({ message: 'Profile updated successfully', patient });
  } catch (error) {
    console.error('Error updating patient profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get Patient Bookings 
export const getPatientBookings = async (req, res) => {
  try {
    // Fetch bookings and populate doctor details
    const bookings = await Booking.find({ patientId: req.auth.id })
      .populate({
        path: "doctorId", // Reference to Doctor model
        select: "name profilePhoto specialization consultingFee" // Select required fields
      })
      .sort({ date: -1 });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching patient bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get All Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};


// Fetch a particular doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Book a Session
export const bookSession = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, urgency, reason } = req.body;

    if (!doctorId || !date || !timeSlot || !urgency || !reason) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }

    // Create a new booking
    const booking = new Booking({
      patientId: req.auth.id,
      doctorId,
      date,
      timeSlot,
      urgency,
      reason,
      status: "Pending",  // Fixed case sensitivity
      cancelledBy: null,  // Fixed default value
    });

    await booking.save();

    // Update the user's booking list
    await Patient.findByIdAndUpdate(req.auth.id, { $push: { bookings: booking._id } });

    res.status(201).json({ message: 'Session booked successfully', booking });
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ message: 'Internal server error' });  
  }
};



export const cancelAppointment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure only the patient who booked can cancel
    if (booking.patientId.toString() !== req.auth.id) {
      return res.status(403).json({ message: "Unauthorized: You can only cancel your own appointment" });
    }

    // Prevent double cancellation
    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    // Only allow cancellation if status is "pending" or "accepted"
    if (!["Pending", "Accepted"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this appointment" });
    }

    // Validate reason
    const cancellationReason = reason && typeof reason === "string" && reason.trim() !== "" 
      ? reason.trim() 
      : "No reason provided";

    // Update appointment status and reason
    booking.status = "Cancelled";
    booking.cancellationReason = cancellationReason;
    booking.cancelledBy = "patient";  // Track who cancelled
    await booking.save();

    res.json({ 
      message: "Appointment cancelled successfully by the patient", 
      updatedAppointment: booking 
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
