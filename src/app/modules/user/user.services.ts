import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from  "http-status-codes"
import bcryptjs from "bcryptjs";
import { env } from "../../config/env";
import { userSearchableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/QuaryBuilder";
import mongoose from "mongoose";
import { Wallet } from "../wallet/wallet.model";

const createUser = async(payload : Partial<IUser>)=>{
    const {email, password, ...rest} = payload;
    const isUserExist = await User.findOne({email});
    if(isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST, "User already exist");
    }
    const session = await mongoose.startSession()
    try {
        session.startTransaction();

        const hashedPassword = await bcryptjs.hash(password as string, Number(env.BCRYPT_SALT_ROUNDS));

        const authProvider : IAuthProvider = {provider : "credentials", providerId : email as string}

        // User.create() with session returns an array, so destructure the first element
        const [newUser] = await User.create([{
            email, 
            password : hashedPassword,
            auths : [authProvider],
            ...rest 
        }], {session})

        // Check if the created user has a role that needs a wallet
        if (newUser.role === Role.USER || newUser.role === Role.AGENT) {
            await Wallet.create([{
                userId: newUser._id,
                balance: 50, // Initial balance ৳50
                isBlocked: false
            }], { session });
        }
        
        // If everything succeeds, commit the transaction
        await session.commitTransaction();
        
        console.log(`✅ User created with wallet: ${newUser.email}`);
        return newUser;

    } catch (error) {
        await session.abortTransaction();
        console.error('❌ User creation failed:', error);
        throw error;
    }
    finally {
        session.endSession();
    }
}



const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};



export const userServices ={
    createUser,
    getAllUsers
    
}