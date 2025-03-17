import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Booking from '../models/Booking.js';

// Admin Registration
export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await admin.save();

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token, message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Patients
export const getAllPatients = async (req, res) => {
  try {
    const Patients = await Patient.find().select('-password');
    res.json(Patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Patient Status
export const updatePatientStatus = async (req, res) => {
  const { patientId, status } = req.body;
  try {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.status = status;
    await patient.save();
    res.json({ message: 'Patient status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Patient
export const deletePatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const patient = await Patient.findByIdAndDelete(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Doctor
export const deleteDoctor = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// View Analytics
export const viewAnalytics = async (req, res) => {
  try {
    const patientCount = await Patient.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const analytics = {
      patientCount,
      doctorCount,
    };
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Get Bookings for a Particular Doctor
export const getDoctorBookings = async (req, res) => {
  const { doctorId } = req.params; // Get doctorId from URL params

  try {
    const bookings = await Booking.find({ doctorId }).populate('patientId');

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this doctor' });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Update Appointment Status (Accept/Reject) by Admin
export const updateAppointmentStatusByAdmin = async (req, res) => {
  const { bookingId, status } = req.body; // Get bookingId and status from request body

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking status updated to ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const cancelAppointmentByAdmin = async (req, res) => {
  try {
    const { bookingId } = req.params; // Get bookingId from URL params

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only allow cancellation if the appointment is pending or accepted
    if (booking.status !== 'pending' && booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Cannot cancel this appointment' });
    }

    // Update the appointment status to "cancelled"
    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Appointment cancelled successfully by Admin' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Admin Registering a Doctor
export const registerDoctorByAdmin = async (req, res) => {
  const { name, email, password, phone, gender, specialization, education, experience, hospitalName, hospitalAddress} = req.body;

  try {
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      specialization,
      education,
      experience,
      hospitalAddress,
      hospitalName,
    });

    await doctor.save();

    res.status(201).json({ message: 'Doctor registered successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
