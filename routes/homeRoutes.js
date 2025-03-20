import express from 'express';
import {
    getAllPatients,
    getAllDoctors,
    getAllBookings,
    addContact,
    getAllContacts
} from '../controllers/homeController.js';

const router = express.Router();

router.get('/patientsdata', getAllPatients);
router.get('/bookingsdata', getAllBookings);
// Doctor Routes
router.get('/doctorsdata', getAllDoctors);

// Contact Routes
router.post('/contact', addContact);
router.get('/contact', getAllContacts);

export default router;