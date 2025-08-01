import { z } from 'zod';

const addMoney = z.object({
    amount: z
        .number()
        .min(1, { message: "Amount must be at least 1 taka" })
        .max(100000, { message: "Amount cannot exceed 100,000 taka per transaction" })
});

const withdraw = z.object({
    amount: z
        .number()
        .min(1, { message: "Amount must be at least 1 taka" })
        .max(50000, { message: "Withdrawal cannot exceed 50,000 taka per transaction" })
});

const sendMoney = z.object({
    receiverEmail: z
        .string()
        .email({ message: "Invalid receiver email format" }),
    amount: z
        .number()
        .min(1, { message: "Amount must be at least 1 taka" })
        .max(25000, { message: "Send money cannot exceed 25,000 taka per transaction" })
});

const cashIn = z.object({
    userEmail: z
        .string()
        .email({ message: "Invalid user email format" }),
    amount: z
        .number()
        .min(1, { message: "Amount must be at least 1 taka" })
        .max(100000, { message: "Cash-in cannot exceed 100,000 taka per transaction" })
});

const cashOut = z.object({
    userEmail: z
        .string()
        .email({ message: "Invalid user email format" }),
    amount: z
        .number()
        .min(1, { message: "Amount must be at least 1 taka" })
        .max(50000, { message: "Cash-out cannot exceed 50,000 taka per transaction" })
});

export const walletValidation = {
    addMoney,
    withdraw,
    sendMoney,
    cashIn,
    cashOut
};