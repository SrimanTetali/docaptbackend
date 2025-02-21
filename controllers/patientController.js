import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

// Register Patient
export const registerPatient = async (req, res) => {
  const { name, email, password, phone, address, gender, dob } = req.body;
  try {
    console.log("Received registration request:", req.body);

    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return res.status(400).json({ message: "Patient already exists" });
    }

    console.log("Patient does not exist, proceeding with registration.");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Password hashed successfully.");

    const patient = new Patient({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      gender,
      dob,
    });

    console.log("Patient object created:", patient);

    await patient.save();

    console.log("Patient saved successfully.");

    res.status(201).json({ message: "Patient registered successfully" });
  } catch (error) {
    console.error("Error in registerPatient:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// Login Patient
export const loginPatient = async (req, res) => {
  const { email, password } = req.body;
  try {
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ patientId: patient._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Patient Profile
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
// Update Patient Profile
export const updatePatientProfile = async (req, res) => {
  const { name, email, phone, address, gender, dob, profilePhoto } = req.body;

  try {
    const patient = await Patient.findById(req.patient);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update only if new values are provided
    patient.name = name || patient.name;
    patient.email = email || patient.email;
    patient.phone = phone || patient.phone;
    patient.address = address || patient.address;
    patient.gender = gender || patient.gender;
    patient.dob = dob || patient.dob;
    patient.profilePhoto = profilePhoto || patient.profilePhoto;

    await patient.save();
    res.json({ message: 'Profile updated successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get Patient Bookings 
export const getPatientBookings = async (req, res) => {
  try {
    // Fetch bookings directly from the Booking collection
    const bookings = await Booking.find({ patientId: req.patient });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this patient' });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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

// Book a Session
export const bookSession = async (req, res) => {
  try {
    const { doctorId, patientId, date, timeSlot, urgency, reason } = req.body;

    if (!doctorId || !patientId || !date || !timeSlot || !urgency || !reason) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Create a new booking
    const booking = new Booking({
      patientId,
      doctorId,
      date,
      timeSlot,
      urgency,
      reason,
      status: 'pending',
    });

    await booking.save();

    res.status(201).json({ message: 'Session booked successfully', appointment: booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const cancelAppointment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;  // Accept cancellation reason

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure only the patient who booked can cancel
    if (booking.patientId.toString() !== req.patient) {
      return res.status(403).json({ message: "Unauthorized: You can only cancel your own appointment" });
    }

    // Only allow cancellation if the status is "pending" or "accepted"
    if (booking.status !== "pending" && booking.status !== "accepted") {
      return res.status(400).json({ message: "Cannot cancel this appointment" });
    }

    // Update appointment status and reason
    booking.status = "cancelled";
    booking.cancellationReason = reason || "No reason provided";  // Store the reason
    await booking.save();

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
