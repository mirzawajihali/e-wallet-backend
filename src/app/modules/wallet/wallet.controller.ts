import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { walletService } from './wallet.services';


const getMyWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?._id ; // Changed from req.user?.userId
        const result = await walletService.getMyWallet(userId);
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Wallet retrieved successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const addMoney = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?._id; // Changed from req.user?.userId
        const { amount } = req.body;
        
        const result = await walletService.addMoney(userId, amount);
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Money added successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const withdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?._id; // Changed from req.user?.userId
        const { amount } = req.body;
        
        const result = await walletService.withdrawMoney(userId, amount);
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Money withdrawn successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const sendMoney = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId =(req as any).user?._id; // Changed from req.user?.userId
        const { receiverEmail, amount } = req.body;
        
        const result = await walletService.sendMoney(userId, receiverEmail, amount);
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Money sent successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const cashIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agentId = (req as any).user?._id; // Changed from req.user?.userId
        const { userEmail, amount } = req.body;
        
        const result = await walletService.cashIn(agentId, userEmail, amount);
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Cash-in completed successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const cashOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agentId = (req as any).user?._id; // Changed from req.user?.userId
        const { userEmail, amount } = req.body;
        
        const result = await walletService.CashOut(agentId, userEmail, amount); // Fixed capitalization
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Cash-out completed successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAllWallets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await walletService.getAllWallets((req as any).query);
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Wallets retrieved successfully',
            meta: result.meta,
            data: result.data
        });
    } catch (error) {
        next(error);
    }
};

const blockWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletId } = req.params;
        const result = await walletService.blockWallet(walletId);
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Wallet blocked successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const unblockWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletId } = req.params;
        const result = await walletService.unblockWallet(walletId);
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Wallet unblocked successfully',
            data: result
        });
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