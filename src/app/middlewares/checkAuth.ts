import { NextFunction, Request, Response } from "express";
import  { JwtPayload } from "jsonwebtoken";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { env } from "../config/env";
import { User } from "../modules/user/user.model";
import { isActive } from "../modules/user/user.interface";
import httpStatus from "http-status-codes";


export const checkAuth  = (...authRoles : string[]) => async (req: Request, res: Response, next: NextFunction) =>{
   try{
     const accessToken = req.headers.authorization;
    if(!accessToken) {
        throw new AppError(403, "No token received")
    }

    const verifiedToken= verifyToken(accessToken, env.JWT_ACCESS_SECRET) as JwtPayload
    
    const isUserExist = await User.findOne({email : verifiedToken.email});
    
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

   
    if(!authRoles.includes(verifiedToken.role))  {
        throw new AppError(403, "You are not authorized to access this resource");
    }

    req.user = verifiedToken
    
    next();
   }
   catch(error) {
    next(error);
   }
}
