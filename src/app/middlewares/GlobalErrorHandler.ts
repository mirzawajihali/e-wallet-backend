import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { handleCastError } from "../helpers/handleCastError";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleValidationError } from "../helpers/handleValidationError";
import { handleZodError } from "../helpers/handleZodError";
import { TErrorSources } from "../interfaces/error.types";

interface ErrorResponse {
    statusCode: number;
    message: string;
    errorSources?: TErrorSources[];
}

// Error handler map for better performance and maintainability
const errorHandlers = new Map<string | number, (err: any) => ErrorResponse>([
    [11000, handleDuplicateError],
    ["CastError", handleCastError],
    ["ValidationError", handleValidationError],
    ["ZodError", handleZodError],
]);

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Early logging for development
    if (env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    let statusCode = 500;
    let message = "Something went wrong";
    let errorSources: TErrorSources[] | undefined;

    // Handle specific error types using the map
    const errorKey = err.code || err.name;
    const errorHandler = errorHandlers.get(errorKey);
    
    if (errorHandler) {
        const simplifiedError = errorHandler(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    // Handle AppError instances
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle generic Error instances
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        message,
        ...(errorSources && { errorSources }),
        ...(env.NODE_ENV === 'development' && {
            error: err,
            stack: err.stack
        })
    });
};