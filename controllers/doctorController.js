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
    res.status(500).json({ message: 'Server error' });
  }
};

// **Login Doctor**
export const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { doctorId: doctor._id },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// **Get Doctor Profile**
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Doctor Profile
export const updateDoctorProfile = async (req, res) => {
  const { name, email, phone,gender, specialization, education, experience, about, consultingFee, profilePhoto } = req.body;

  try {
    const doctor = await Doctor.findById(req.doctor);
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

    await doctor.save();
    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// **Get Doctor Bookings (Fixed)**
export const getDoctorBookings = async (req, res) => {
  try {
    console.log('Fetching bookings for doctorId:', req.doctor);

    const bookings = await Booking.find({ doctorId: req.doctor }).populate('patientId');
    console.log('Bookings found:', bookings);

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this doctor' });
    }

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching doctor bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// **Update Booking Status**
export const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  try {
    console.log('Updating booking status for bookingId:', bookingId);

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const cancelAppointmentByDoctor = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;  // Accept cancellation reason

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure only the assigned doctor can cancel
    if (booking.doctorId.toString() !== req.doctor) {
      return res.status(403).json({ message: "Unauthorized: You can only cancel your own appointments" });
    }

    // Only allow cancellation if the status is "pending" or "accepted"
    if (booking.status !== "pending" && booking.status !== "accepted") {
      return res.status(400).json({ message: "Cannot cancel this appointment" });
    }

    // Update appointment status and reason
    booking.status = "cancelled";
    booking.cancellationReason = reason || "No reason provided";  // Store the reason
    await booking.save();

    res.json({ message: "Appointment cancelled successfully by the doctor" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
