import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import habitsRouter from './routes/habits.js';
import authRouter from './routes/authRoutes.js'; 

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/habits', habitsRouter);
app.use('/api/auth', authRouter); 

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
