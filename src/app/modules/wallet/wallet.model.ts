import { Schema, model } from 'mongoose';
import { IWallet, IWalletMethods, WalletModel } from './wallet.interface';

const walletSchema = new Schema<IWallet, WalletModel, IWalletMethods>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 50,
    min: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Instance methods
walletSchema.methods.addMoney = async function(amount: number) {
  this.balance += amount;
  return await this.save();
};

walletSchema.methods.deductMoney = async function(amount: number) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  this.balance -= amount;
  return await this.save();
};

export const Wallet = model<IWallet, WalletModel>('Wallet', walletSchema);