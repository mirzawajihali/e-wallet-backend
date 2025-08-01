import { NextFunction , Request, Response } from "express";
import { transactionServices } from "./transaction.services";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes';

        const getMyTransaction = async(req : Request, res: Response, next : NextFunction) => {
            try{
                const userId = (req as any).user._id;
            const query = req.query as Record<string, string>;
                const result = await transactionServices.getMyTransactions(userId, query);

                sendResponse(res, {
                    statusCode: httpStatus.OK,
                    success: true,
                    message: 'My transactions retrieved successfully',
                    data: result.data,
                    meta: result.meta
                });
            }catch(error){
                next(error);


            
            }

            



        }


        const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
            try {
                const result = await transactionServices.getAllTransactions(req.query as Record<string, string>);
                
                sendResponse(res, {
                    success: true,
                    statusCode: httpStatus.OK,
                    message: "All transactions retrieved successfully",
                    meta: result.meta,
                    data: result.data,
                });
            } catch (error) {
                next(error);
            }
        };

        const getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
             try {
        const { transactionId } = req.params;
        const userId = (req as any).user?.role === 'ADMIN' ? undefined : (req as any).user?._id;
        
        const result = await transactionServices.getTransactionById(transactionId, userId);
        
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Transaction retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
        const getTransactionStats = async (req: Request, res: Response, next: NextFunction) => {
            try {
                const result = await transactionServices.getTransactionStats();
                
                sendResponse(res, {
                    success: true,
                    statusCode: httpStatus.OK,
                    message: "Transaction statistics retrieved successfully",
                    data: result,
                });
            } catch (error) {
                next(error);
            }
        };




export const TransactionControllers = {
    getMyTransaction,
    getAllTransactions,
    getTransactionById,
    getTransactionStats
};