import cors from 'cors';
import express, { Request, Response } from 'express';
import NotFound from './app/middlewares/NotFound';
import cookieParser from 'cookie-parser';
import { router } from './app/routes';
import { globalErrorHandler } from './app/middlewares/GlobalErrorHandler';
import passport from 'passport';

// Import passport configuration BEFORE using passport
import './app/config/passport';


const app = express();
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(cors({
  origin: ["http://localhost:5173", "https://zenopay.vercel.app"],
  credentials: true, 
}));

app.use(passport.initialize());

app.get('/', (req : Request, res : Response) => {
    res.send('Hello World');
});



// Register API routes
app.use('/api/v1', router);

app.use(NotFound);

// Global error handler must be last
app.use(globalErrorHandler);

export default app;