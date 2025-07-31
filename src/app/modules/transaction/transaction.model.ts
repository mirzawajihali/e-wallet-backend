import { model, Schema } from 'mongoose';
import { ITransaction, TransactionStatus, TransactionType } from './transaction.interface';
const transactionSchema = new Schema<ITransaction>({
    type: { type: String, 
        enum : Object.values(TransactionType),
        required: true },
    amount: { type: Number, required: true , min :1},
    fee: { type: Number, default : 0 },
    fromWallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    toWallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    description: { type: String, maxlength: 500 },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: Object.values(TransactionStatus),
        default: TransactionStatus.PENDING
    },
},{
    timestamps: true,
});

export const Transaction = model<ITransaction>('Transaction', transactionSchema);