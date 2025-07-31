import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import  httpStatus from "http-status-codes";
import { Wallet } from "./wallet.model";
import { TransactionStatus, TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
class WalletService {
    async getMyWallet(userId : string){
        const wallet = await Wallet.findOne({userId}).populate('userId', 'name email role');
        if(!wallet){
            throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
        }
        return wallet;
    }

    async addMoney(userId : string, amount: number){
        const session = await mongoose.startSession();
       try{
        session.startTransaction();
         const wallet  = await Wallet.findOne({userId}).session(session);
         if(!wallet){
            throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
         }

         wallet.balance += amount;
            await wallet.save({session});


              await Transaction.create([{
        type: TransactionType.DEPOSIT,
        amount,
        toWallet: wallet._id,
        initiatedBy: userId,
        status : TransactionStatus.COMPLETED,
        description : `Added ৳${amount} to wallet`
         }], {session});

         await session.commitTransaction();
         console.log(`✅ Added ৳${amount} to wallet for user ${userId}`);
         return wallet;
       }

         catch(error){
                await session.abortTransaction();
                console.error('❌ Failed to add money to wallet:', error);
                throw error;
         }
         finally {
          session.endSession();

       }

       }

     
}