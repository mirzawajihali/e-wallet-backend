import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QuaryBuilder";
import { transactionSearchableFields } from "./transaction.constant";
import { Transaction } from "./transaction.model";
import httpStatus from 'http-status-codes';






class transactionService {



    // Helper method to get user's wallet IDs
    private async getUserWalletIds(userId: string): Promise<string[]> {
        const { Wallet } = await import('../wallet/wallet.model');
        const wallets = await Wallet.find({ userId }, '_id');
        return wallets.map(wallet => wallet._id.toString());
    }
   async getMyTransactions(userId : string, query : Record<string, string>) {
        const queryBuilder = new QueryBuilder(
            Transaction.find({ 
                $or: [
                    { initiatedBy: userId },
                    { fromWallet: { $in: await this.getUserWalletIds(userId) } },
                    { toWallet: { $in: await this.getUserWalletIds(userId) } }
                ]
            })
            .populate('fromWallet', 'balance')
            .populate('toWallet', 'balance')
            .populate('initiatedBy', 'name email role'), 
            query
        );
        const transactionsData = queryBuilder
            .filter()
            .search(transactionSearchableFields)
            .sort()
            .fields()
            .paginate();

        const [data, meta] = await Promise.all([
            transactionsData.build(),
            queryBuilder.getMeta()
        ])

        return {
            data,
            meta
        }
    }

    async getAllTransactions(query : Record <string, string>){
        const queryBuilder = new QueryBuilder(
            Transaction.find()
            .populate('fromWallet', 'balance userId')
            .populate('toWallet', 'balance userId') 
            .populate('initiatedBy', 'name email role'), 
            query
        );
        const transactionsData = queryBuilder
            .filter()
            .search(transactionSearchableFields)
            .sort()
            .fields()
            .paginate();


            const [data, meta] = await Promise.all([
            transactionsData.build(),
            queryBuilder.getMeta()
        ]);

        return { data, meta };
    }


    async getTransactionById(transactionId : string, userId : string){
        const transaction = await Transaction.findById(transactionId)
        .populate('fromWallet', 'balance userId')
        .populate('toWallet', 'balance userId')
        .populate('initiatedBy', 'name email role');
        if (!transaction) {
            throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
        }

        return transaction;
    }

    async getTransactionStats(){
         const stats = await Transaction.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    avgAmount: { $avg: '$amount' }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);

        const totalTransactions = await Transaction.countDocuments();
        const totalVolume = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        return {
            overview: {
                totalTransactions,
                totalVolume: totalVolume[0]?.total || 0
            },
            byType: stats
        };
    
    }





     

    
}

export const transactionServices = new transactionService();