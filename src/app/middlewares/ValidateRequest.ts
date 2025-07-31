import { NextFunction, Request, Response} from "express";

import {ZodSchema} from "zod";


export const ValidateRequest = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Raw request body:', req.body);
        console.log('Body type:', typeof req.body);
        
        const validatedData = await schema.parseAsync(req.body);
        req.body = validatedData;
        console.log('Validated request body:', req.body);
        next();
    } catch (error) {
        console.log('Validation error:', error);
        next(error);
    }
}