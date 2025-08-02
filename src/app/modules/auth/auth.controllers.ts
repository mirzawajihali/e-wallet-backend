/* eslint-disable @typescript-eslint/no-explicit-any */
import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.services";  // Updated import
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/AuthCookie";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../utils/UserTokens";
import { env } from "../../config/env";
import passport from "passport";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
   
    // res.cookie('refreshToken', loginInfo.refreshToken, {
    //     httpOnly: true,
       
    //     secure : false,
    // })
    
    // res.cookie('accessToken', loginInfo.accessToken, {
    //     httpOnly: true,
       
    //     secure : false,
    // })

   
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewAccessToken =  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
     if(!refreshToken){
        throw new AppError(httpStatus.BAD_REQUEST, "Refresh token not found");
    }
    const tokenInfo = await authService.getNewAccessToken(refreshToken as string);  // Updated method call

    //    res.cookie('accessToken', tokenInfo.accessToken, {
    //     httpOnly: true,
       
    //     secure : false,
    // })
   setAuthCookie(res, tokenInfo);
   
    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "New access token retrived Successfully",
        data : tokenInfo,
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logout =  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    res.clearCookie('refreshToken', {
        httpOnly : true,
        secure : false,
        sameSite : "lax"
    });
    
    res.clearCookie('accessToken', {
        httpOnly : true,
        secure : false,
        sameSite : "lax"
    });
    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Log out Successfully",
        data : null,
    })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetPassword =  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
   

    const newPassword = req.body.newPassword;

    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;


     await authService.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload);  // Updated method call
   
    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "password changed succesfully Successfully",
        data : null,
    })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const googleCallbackController =  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    

    let redirectTo = req.query.state ? req.query.state as string : "" as string;

    if(redirectTo.startsWith("/")){
        redirectTo = redirectTo.slice(1);
    }
   
    const user = req.user;
    if(!user){
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    }
    const tokenInfo =  createUserTokens(user );
    setAuthCookie(res, tokenInfo);

    res.redirect(`${env.FRONTEND_URL}/${redirectTo}`); // Redirect to the frontend with tokens
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackController
    
}
