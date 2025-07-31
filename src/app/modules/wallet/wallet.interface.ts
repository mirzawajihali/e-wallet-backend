import { Model, Types } from "mongoose";

export interface IWallet {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWalletMethods {
  addMoney(amount: number): Promise<IWallet>;
  deductMoney(amount: number): Promise<IWallet>;
}

export type WalletModel = Model<IWallet, Record<string, unknown>, IWalletMethods>;