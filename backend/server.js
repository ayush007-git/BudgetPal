import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import databaseRoutes from './routes/database.js';
import groupRoutes from './routes/groupRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health route
app.get('/', (req, res) => {
    res.send({
        success: true,
        message: "BudgetPal Backend API is running",
        version: "1.0.0",
        endpoints: {
            auth: {
                signup: "POST /api/auth/signup",
                login: "POST /api/auth/login",
                forgotPassword: "POST /api/auth/forgot-password",
                getEmergencyQuestion: "GET /api/auth/emergency-question/:username",
                setEmergencyQuestion: "PUT /api/auth/set-emergency-question"
            },
            database: {
                clear: "DELETE /api/database/clear",
                stats: "GET /api/database/stats",
                users: "GET /api/database/users"
            }
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running at port ${PORT}`);
    console.log(`📱 API Documentation: http://localhost:${PORT}`);
});