import express from 'express';
import {
    getAllDoctors,
    addContact,
    getAllContacts
} from '../controllers/homeController.js';

const router = express.Router();

// Doctor Routes
router.get('/doctorsdata', getAllDoctors);

// Contact Routes
router.post('/contact', addContact);
router.get('/contact', getAllContacts);

export default router;