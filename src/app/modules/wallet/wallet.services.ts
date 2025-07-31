import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import  httpStatus from "http-status-codes";
import { Wallet } from "./wallet.model";
import { TransactionStatus, TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
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


       async withdrawMoney(userId : string, amount: number){
        const session = await mongoose.startSession();
       try{
        session.startTransaction();
         const wallet  = await Wallet.findOne({userId}).session(session);
         if(!wallet){
            throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
         }

         if(wallet.balance < amount){
            throw new AppError(httpStatus.BAD_REQUEST, "insufficient balance")
         }

         wallet.balance -= amount;

         await wallet.save({session});

        await Transaction.create([{
                type: TransactionType.WITHDRAW,
                amount,
                fromWallet: wallet._id,
                initiatedBy: userId,
                status: TransactionStatus.COMPLETED,
                description: 'Money withdrawn from wallet'
            }], { session })


            await session.commitTransaction();
             console.log(`✅ Money withdrawn: ${amount} from user ${userId}`);
            return wallet;
        }
        catch(error){
            await session.abortTransaction();
            console.error('❌ Failed to withdraw money from wallet:', error);
            throw error;
        }

        finally {
            session.endSession();
        }



    
     
}

        async sendMoney(fromUserId : string, toUserId: string, amount : number){
        const session = await mongoose.startSession();
        try{;

            session.startTransaction();
            // now have to find receiver by id

            const toUser = await User.findOne({toUserId}).session(session);
            if(!toUser){
                throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
            }

            const fromWallet = await Wallet.findOne({userId: fromUserId}).session(session);
            const toWallet = await Wallet.findOne({userId: toUserId}).session(session);
            if(!fromWallet || !toWallet){
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
                initiatedBy: fromUserId,
                status: TransactionStatus.COMPLETED,
                description: `Money sent to ${toUser.email}`
            }], { session });

            await session.commitTransaction();
            console.log(`✅ Money sent: ${amount} from user ${fromUserId} to user ${toUserId}`);
            return { fromWallet, toWallet };
        }
        catch(error){
            await session.abortTransaction();
            console.error('❌ Failed to send money:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
        }


}