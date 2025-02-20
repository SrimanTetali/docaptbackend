import express from 'express';
import {
    getDoctorBookings,
    getDoctorProfile,
    loginDoctor,
    registerDoctor,
    updateDoctorProfile,
    updateBookingStatus,
    cancelAppointmentByDoctor 
} from '../controllers/doctorController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/profile', auth, getDoctorProfile);
router.put('/profile', auth, updateDoctorProfile);
router.get('/bookings', auth, getDoctorBookings);
router.put('/booking-status', auth, updateBookingStatus);
router.put('/cancel-appointment/:bookingId', auth, cancelAppointmentByDoctor);

export default router;
