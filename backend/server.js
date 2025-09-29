import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import databaseRoutes from './routes/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : true),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running at port ${PORT}`);
    console.log(`📱 API Documentation: http://localhost:${PORT}`);
});