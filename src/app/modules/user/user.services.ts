import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from  "http-status-codes"
import bcryptjs from "bcryptjs";
import { env } from "../../config/env";
import { userSearchableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/QuaryBuilder";

const createUser = async(payload : Partial<IUser>)=>{
    const {email, password, ...rest} = payload;
    const isUserExist = await User.findOne({email});
    if(isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST, "User already exist");
    }
     const hashedPassword = await bcryptjs.hash(password as string, Number(env.BCRYPT_SALT_ROUNDS));


    const authProvider : IAuthProvider = {provider : "credentials", providerId : email as string}

      const user = await User.create({
            email, 
            password : hashedPassword,
            auths : [authProvider],
            ...rest })


            return user

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
    createUser
    
}