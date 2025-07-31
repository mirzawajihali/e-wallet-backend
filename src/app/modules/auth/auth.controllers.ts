import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import httpStatus from 'http-status-codes';
import { catchAsync } from "../../utils/catchAsync";
import { createUserTokens } from "../../utils/UserTokens";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/AuthCookie";
import { Request, Response, NextFunction } from "express";


const credentialsLogin =  catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // const loginInfo = await authServices.credentialsLogin(req.body)
    passport.authenticate("local", async(err : any, user : any, info : any) =>{

        if(err){
            return next(new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error"));
        }

        if(!user){
            return next(new AppError(401, info.message));
        }

        const userTokens = createUserTokens(user);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password : pass  , ...rest } = user.toObject();// Remove password from user object
         setAuthCookie(res, userTokens)

    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "login Successfully",
        data : {
            accessToken : userTokens.accessToken,
            refreshToken : userTokens.refreshToken,
            user : rest 
        },
    })  
    })(req, res, next) 
   
    

   
})


export const AuthControllers = {
    credentialsLogin
};