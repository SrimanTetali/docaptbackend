import express from 'express';
import {
    getAllDoctors,
    deleteDoctor,
    getAllPatients,
    loginAdmin,
    registerAdmin,
    updatePatientStatus,
    viewAnalytics,
    getDoctorBookings,
    registerDoctorByAdmin
} from '../controllers/adminController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerAdmin);  
router.post('/login', loginAdmin);

router.get('/patients', auth, getAllPatients);
router.put('/patient-status', auth, updatePatientStatus);

router.get('/doctors', auth, getAllDoctors);
router.get('/doctor-bookings/:doctorId', auth, getDoctorBookings);
router.delete('/delete-doctor/:doctorId', auth, deleteDoctor);

router.get('/analytics', auth, viewAnalytics);
router.post('/register-doctor', auth, registerDoctorByAdmin);

export default router;
