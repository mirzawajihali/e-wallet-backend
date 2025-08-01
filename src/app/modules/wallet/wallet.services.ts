import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import  httpStatus from "http-status-codes";
import { Wallet } from './wallet.model';
import { TransactionStatus, TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/QuaryBuilder";

class WalletService {
    async getMyWallet(userId: string) {
        console.log('🔍 Debug - Received userId:', userId);
        console.log('🔍 Debug - userId type:', typeof userId);
        
        // Convert string to ObjectId for proper MongoDB query
        const objectId = new mongoose.Types.ObjectId(userId);
        console.log('🔍 Debug - Converted ObjectId:', objectId);
        
        const wallet = await Wallet.findOne({ userId: objectId }).populate('userId', 'name email role');
        console.log('🔍 Debug - Found wallet:', wallet ? 'YES' : 'NO');
        
        if (!wallet) {
            throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
        }
        return wallet;
    }

    async addMoney(userId: string, amount: number) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            
            // Convert string to ObjectId
            const objectId = new mongoose.Types.ObjectId(userId);
            const wallet = await Wallet.findOne({ userId: objectId }).session(session);
            
            if (!wallet) {
                throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
            }

            wallet.balance += amount;
            await wallet.save({ session });

            await Transaction.create([{
                type: TransactionType.DEPOSIT,
                amount,
                toWallet: wallet._id,
                initiatedBy: objectId,
                status: TransactionStatus.COMPLETED,
                description: `Added ৳${amount} to wallet`
            }], { session });

            await session.commitTransaction();
            console.log(`✅ Added ৳${amount} to wallet for user ${userId}`);
            return wallet;
        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Failed to add money to wallet:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }


    async withdrawMoney(userId: string, amount: number) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            
            // Convert string to ObjectId
            const objectId = new mongoose.Types.ObjectId(userId);
            const wallet = await Wallet.findOne({ userId: objectId }).session(session);
            
            if (!wallet) {
                throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
            }

            if (wallet.balance < amount) {
                throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
            }

            wallet.balance -= amount;
            await wallet.save({ session });

            await Transaction.create([{
                type: TransactionType.WITHDRAW,
                amount,
                fromWallet: wallet._id,
                initiatedBy: objectId,
                status: TransactionStatus.COMPLETED,
                description: 'Money withdrawn from wallet'
            }], { session });

            await session.commitTransaction();
            console.log(`✅ Money withdrawn: ${amount} from user ${userId}`);
            return wallet;
        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Failed to withdraw money from wallet:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async sendMoney(fromUserId: string, toUserEmail: string, amount: number) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            
            // Convert string to ObjectId
            const fromObjectId = new mongoose.Types.ObjectId(fromUserId);
            
            // Find receiver by email
            const toUser = await User.findOne({ email: toUserEmail }).session(session);
            if (!toUser) {
                throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
            }

            const fromWallet = await Wallet.findOne({ userId: fromObjectId }).session(session);
            const toWallet = await Wallet.findOne({ userId: toUser._id }).session(session);
            
            if (!fromWallet || !toWallet) {
                throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
            }

            if (fromWallet.balance < amount) {
                throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance');
            }
            
            // Update balances
            fromWallet.balance -= amount;
            toWallet.balance += amount;
            
            await fromWallet.save({ session });
            await toWallet.save({ session });

            await Transaction.create([{
                type: TransactionType.SEND_MONEY,
                amount,
                fromWallet: fromWallet._id,
                toWallet: toWallet._id,
                initiatedBy: fromObjectId,
                status: TransactionStatus.COMPLETED,
                description: `Money sent to ${toUser.email}`
            }], { session });

            await session.commitTransaction();
            console.log(`✅ Money sent: ${amount} from user ${fromUserId} to user ${toUserEmail}`);
            return { fromWallet, toWallet };
        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Failed to send money:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }



    async cashIn(agentId: string, userEmail: string, amount: number) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            
            // Convert string to ObjectId
            const agentObjectId = new mongoose.Types.ObjectId(agentId);
            
            const user = await User.findOne({ email: userEmail }).session(session);
            if (!user) {
                throw new AppError(httpStatus.NOT_FOUND, "User not found");
            }
            
            const userWallet = await Wallet.findOne({ userId: user._id }).session(session);
            if (!userWallet) {
                throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
            }
            
            userWallet.balance += amount;
            await userWallet.save({ session });

            await Transaction.create([{
                type: TransactionType.CASH_IN,
                amount,
                toWallet: userWallet._id,
                initiatedBy: agentObjectId,
                status: TransactionStatus.COMPLETED,
                description: `Cash in of ৳${amount} by agent ${agentId}`
            }], { session });

            await session.commitTransaction();
            console.log(`✅ Cash in of ৳${amount} for user ${userEmail} by agent ${agentId}`);
            return userWallet;
        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Failed to cash in:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }
    async CashOut(agentId: string, userEmail: string, amount: number) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            
            // Convert string to ObjectId
            const agentObjectId = new mongoose.Types.ObjectId(agentId);
            
            const user = await User.findOne({ email: userEmail }).session(session);
            if (!user) {
                throw new AppError(httpStatus.NOT_FOUND, "User not found");
            }
            
            const userWallet = await Wallet.findOne({ userId: user._id }).session(session);
            if (!userWallet) {
                throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
            }
            
            if (userWallet.balance < amount) {
                throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
            }
            
            userWallet.balance -= amount;
            await userWallet.save({ session });

            await Transaction.create([{
                type: TransactionType.CASH_OUT,
                amount,
                fromWallet: userWallet._id,
                initiatedBy: agentObjectId,
                status: TransactionStatus.COMPLETED,
                description: `Cash out of ৳${amount} by agent ${agentId}`
            }], { session });

            await session.commitTransaction();
            console.log(`✅ Cash out of ৳${amount} for user ${userEmail} by agent ${agentId}`);
            return userWallet;
        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Failed to cash out:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }


            // Admin: Get all wallets
    async getAllWallets(query: Record<string, string>) {
        const queryBuilder = new QueryBuilder(
            Wallet.find().populate('userId', 'name email role'), 
            query
        );
        
        const walletsData = queryBuilder
            .filter()
            .sort()
            .fields()
            .paginate();

        const [data, meta] = await Promise.all([
            walletsData.build(),
            queryBuilder.getMeta()
        ]);

        return { data, meta };
    }

    async blockWallet(walletId : string){
       const wallet = await Wallet.findByIdAndUpdate(
            walletId, 
            { isBlocked: true }, 
            { new: true }
        ).populate('userId', 'name email');
        
        if (!wallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found');
        }
        
        console.log(` Wallet blocked: ${walletId}`);
        return wallet;

    }

    async unblockWallet(walletId: string) {
        const wallet = await Wallet.findByIdAndUpdate(
            walletId, 
            { isBlocked: false }, 
            { new: true }
        ).populate('userId', 'name email');
        
        if (!wallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found');
        }
        
        console.log(`✅ Wallet unblocked: ${walletId}`);
        return wallet;
    }
    

        }



        
export const walletService = new WalletService();