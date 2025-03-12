import express from 'express';
import {
    bookSession,
    getPatientBookings,
    getPatientProfile,
    loginPatient,
    registerPatient,
    getAllDoctors,
    getDoctorById,
    updatePatientProfile,
    getDoctorBookings,
    cancelAppointment,
    
} from '../controllers/patientController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/profile', auth, getPatientProfile);
router.put('/profile', auth, updatePatientProfile);
router.get('/bookings', auth, getPatientBookings);
router.get('/doctors', auth, getAllDoctors);
router.get("/doctors/:id", auth, getDoctorById);
router.post('/book-session', auth, bookSession);
router.put('/cancel/:bookingId', auth, cancelAppointment);
router.get('/doctors/:doctorId/bookings', getDoctorBookings);

export default router;