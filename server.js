import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();
const app = express();

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use('/api/patient', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api', homeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port  http://localhost:${PORT}`));
