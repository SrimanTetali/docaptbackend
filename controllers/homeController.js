import Doctor from '../models/Doctor.js';
import Contact from '../models/Contact.js';
import Patient from '../models/Patient.js';
import Booking from '../models/Booking.js';

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
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

// Add Contact Details
export const addContact = async (req, res) => {
  try {
    const { firstname, lastname, phonenumber, email, problem } = req.body;

    if (!firstname || !lastname || !phonenumber || !email || !problem) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newContact = new Contact({ firstname, lastname, phonenumber, email, problem });
    await newContact.save();

    res.status(201).json({ message: 'details are submitted successfully', contact: newContact });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
