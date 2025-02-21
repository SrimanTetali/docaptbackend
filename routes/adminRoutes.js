import express from 'express';
import {
    getAllDoctors,
    getAllPatients,
    loginAdmin,
    registerAdmin,
    updatePatientStatus,
    viewAnalytics,
    getDoctorBookings,
    updateAppointmentStatusByAdmin,
    cancelAppointmentByAdmin,
    registerDoctorByAdmin
} from '../controllers/adminController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerAdmin);  
router.post('/login', loginAdmin);
router.get('/patients', auth, getAllPatients);
router.get('/doctors', auth, getAllDoctors);
router.put('/patient-status', auth, updatePatientStatus);
router.get('/analytics', auth, viewAnalytics);
router.get('/doctor-bookings/:doctorId', auth, getDoctorBookings);
router.put('/appointment-status', auth, updateAppointmentStatusByAdmin);
router.delete('/cancel-appointment/:bookingId', auth, cancelAppointmentByAdmin); 
router.post('/register-doctor', auth, registerDoctorByAdmin);

export default router;
