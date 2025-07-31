import { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { isActive, IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import AppError from "../errorHelpers/AppError";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";

export const createUserTokens = (user: Partial<IUser>) => {
    
    const jwtPayload = { email: user.email, user_id: user._id , role : user.role }

  
    const accessToken = generateToken(jwtPayload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES);

    const refreshToken = generateToken(jwtPayload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES);
    

    return {
        accessToken, refreshToken
    }

}

export const createNewAccessTokenWithRefreshToken = async (refreshToken : string) => {
     const verifiedRefreshToken = verifyToken(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    

    const isUserExist = await User.findOne({email : verifiedRefreshToken.email});
    
    // Fix: Check if user DOESN'T exist (opposite logic)
    if(!isUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    if(isUserExist.isActive === isActive.BLOCKED){
        throw new AppError(httpStatus.NOT_FOUND, "User is blocked");
    }
    if(isUserExist.isDeleted){
        throw new AppError(httpStatus.NOT_FOUND, "User is deleted");
    }

   
        const jwtPayload ={
            userId : isUserExist._id,
            email : isUserExist.email,
            role : isUserExist.role

        }

        const accessToken = generateToken(jwtPayload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES);
   

        return accessToken

}