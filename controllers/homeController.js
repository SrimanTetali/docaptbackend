import Doctor from '../models/Doctor.js';
import Contact from '../models/Contact.js';

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
