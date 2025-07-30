
import express from 'express';
import NotFound from './app/middlewares/NotFound';


const app = express();

app.use(express.json());


app.use(NotFound)

export default app;