import { Types } from "mongoose";

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  SEND_MONEY = 'SEND_MONEY',
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ITransaction {
  _id?: Types.ObjectId;
  type: TransactionType;
  amount: number;
  fee?: number;
  fromWallet?: Types.ObjectId;
  toWallet?: Types.ObjectId;
  initiatedBy: Types.ObjectId; // User or Agent ID
  status: TransactionStatus;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}