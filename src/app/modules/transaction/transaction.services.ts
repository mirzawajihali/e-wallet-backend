import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QuaryBuilder";
import { transactionSearchableFields } from "./transaction.constant";
import { Transaction } from "./transaction.model";
import httpStatus from 'http-status-codes';
import mongoose from "mongoose";






class transactionService {



    // Helper method to get user's wallet IDs
    private async getUserWalletIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
        const { Wallet } = await import('../wallet/wallet.model');
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const wallets = await Wallet.find({ userId: userObjectId }, '_id');
        return wallets.map(wallet => wallet._id);
    }
   async getMyTransactions(userId : string, query : Record<string, string>) {
        console.log('🔍 getMyTransactions called with userId:', userId);
        console.log('🔍 userId type:', typeof userId);
        
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('🔍 userObjectId:', userObjectId);
        
        const userWalletIds = await this.getUserWalletIds(userId);
        console.log('🔍 userWalletIds:', userWalletIds);
        
        // Build user-specific filter that must always be applied
        const userFilter = { 
            $or: [
                { initiatedBy: userObjectId },
                { fromWallet: { $in: userWalletIds } },
                { toWallet: { $in: userWalletIds } }
            ]
        };
        
        // Merge user filter with any additional query filters
        const additionalFilters = { ...query };
        // Remove QueryBuilder specific fields that shouldn't be used as filters
        const excludeFields = ['page', 'limit', 'sort', 'fields', 'searchTerm'];
        excludeFields.forEach(field => delete additionalFilters[field]);
        
        // Combine user filter with additional filters
        const finalFilter = Object.keys(additionalFilters).length > 0 
            ? { $and: [userFilter, additionalFilters] }
            : userFilter;
            
        console.log('🔍 Final MongoDB query filter:', JSON.stringify(finalFilter, null, 2));
        
        // Use Transaction.find with the complete filter, then apply other QueryBuilder methods
        let transactionQuery = Transaction.find(finalFilter)
            .populate('fromWallet', 'balance')
            .populate('toWallet', 'balance')
            .populate('initiatedBy', 'name email role');
            
        // Apply sorting
        const sort = query.sort || "-createdAt";
        transactionQuery = transactionQuery.sort(sort);
        
        // Apply field selection
        if (query.fields) {
            const fields = query.fields.split(",").join(" ");
            transactionQuery = transactionQuery.select(fields);
        }
        
        // Apply search if searchTerm is provided
        if (query.searchTerm && transactionSearchableFields.length > 0) {
            const searchQuery = {
                $or: transactionSearchableFields.map(field => ({ 
                    [field]: { $regex: query.searchTerm, $options: "i" } 
                }))
            };
            // Combine with existing filter
            const searchFilter = { $and: [finalFilter, searchQuery] };
            transactionQuery = Transaction.find(searchFilter)
                .populate('fromWallet', 'balance')
                .populate('toWallet', 'balance')
                .populate('initiatedBy', 'name email role')
                .sort(sort);
                
            if (query.fields) {
                const fields = query.fields.split(",").join(" ");
                transactionQuery = transactionQuery.select(fields);
            }
        }
        
        // Apply pagination
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        transactionQuery = transactionQuery.skip(skip).limit(limit);
        
        // Execute query and get count for meta
        const [data, totalDocuments] = await Promise.all([
            transactionQuery.exec(),
            Transaction.countDocuments(finalFilter)
        ]);
        
        const totalPage = Math.ceil(totalDocuments / limit);
        const meta = {
            page,
            limit,
            total: totalDocuments,
            totalPage,
            hasNextPage: page < totalPage,
            hasPrevPage: page > 1
        };

        console.log('🔍 Found transactions count:', data.length);
        console.log('🔍 Total documents matching filter:', totalDocuments);

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