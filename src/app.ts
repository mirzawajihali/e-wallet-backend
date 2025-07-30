import cors from 'cors';
import express, { Request, Response } from 'express';
import NotFound from './app/middlewares/NotFound';
import cookieParser from 'cookie-parser';


const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.get('/', (req : Request, res : Response) => {
    res.send('Hello World');
});



app.use(NotFound)

export default app;