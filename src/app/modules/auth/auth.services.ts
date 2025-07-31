/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {  IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs"
import AppError from "../../errorHelpers/AppError";


import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/UserTokens";
import { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";



const getNewAccessToken = async (refreshToken : string) =>{
   
    
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);
    
    return {
            
           
           accessToken : newAccessToken,
    }
}
const resetPassword = async (oldPassword : string, newPassword : string,  decodedToken: JwtPayload) =>{
    

    const user = await User.findOne({email : decodedToken.email});
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string);

    if(!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

     
    user!.password = await bcryptjs.hash(newPassword, Number(env.BCRYPT_SALT_ROUNDS));

    await user!.save();
    
    
    
   
    
}

export  const authServices ={
   
    getNewAccessToken,
    resetPassword
}