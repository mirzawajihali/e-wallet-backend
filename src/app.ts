import cors from 'cors';
import express, { Request, Response } from 'express';
import NotFound from './app/middlewares/NotFound';
import cookieParser from 'cookie-parser';
import { router } from './app/routes';
import { globalErrorHandler } from './app/middlewares/GlobalErrorHandler';


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors());

app.get('/', (req : Request, res : Response) => {
    res.send('Hello World');
});



// Register API routes
app.use('/api/v1', router);

app.use(NotFound);

// Global error handler must be last
app.use(globalErrorHandler);

export default app;