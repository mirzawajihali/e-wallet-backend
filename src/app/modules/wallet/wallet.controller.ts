import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { walletService } from './wallet.services';
import { sendResponse } from '../../utils/sendResponse';


const getMyWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?._id ; // Changed from req.user?.userId
        const result = await walletService.getMyWallet(userId);
        
       sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet retrieved successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

const addMoney = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?._id; // Changed from req.user?.userId
        const { amount } = req.body;
        
        const result = await walletService.addMoney(userId, amount);
        
        sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money Added successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

const withdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?._id; // Changed from req.user?.userId
        const { amount } = req.body;
        
        const result = await walletService.withdrawMoney(userId, amount);
        
       sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money withdrawn successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

const sendMoney = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId =(req as any).user?._id; // Changed from req.user?.userId
        const { receiverEmail, amount } = req.body;
        
        const result = await walletService.sendMoney(userId, receiverEmail, amount);
        
       sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Send money successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

const cashIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agentId = (req as any).user?._id; // Changed from req.user?.userId
        const { userEmail, amount } = req.body;
        
        const result = await walletService.cashIn(agentId, userEmail, amount);
        
       sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cash-in completed successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

const cashOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agentId = (req as any).user?._id; // Changed from req.user?.userId
        const { userEmail, amount } = req.body;
        
        const result = await walletService.CashOut(agentId, userEmail, amount); // Fixed capitalization
        
       sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cashout completed successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

const getAllWallets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await walletService.getAllWallets((req as any).query);
        
      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Wallet retrieved successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

const blockWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletId } = req.params;
        const result = await walletService.blockWallet(walletId);
        
        sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet blocked successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

const unblockWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletId } = req.params;
        const result = await walletService.unblockWallet(walletId);
        
       sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet retrieved successfully",
        data : result,
    })
    } catch (error) {
        next(error);
    }
};

export const WalletControllers = {
    getMyWallet,
    addMoney,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
    getAllWallets,
    blockWallet,
    unblockWallet
};