import { Response } from "express"
import { env } from "process";

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie=(res : Response , tokenInfo : AuthTokens) =>{
    if(tokenInfo.refreshToken) {
            res.cookie('refreshToken', tokenInfo.refreshToken, {
        httpOnly: true,
        secure : env.NODE_ENV === 'production', 
       
        sameSite:"none",
    })
    
    }

    if(tokenInfo.accessToken) {
         res.cookie('accessToken', tokenInfo.accessToken, {
        httpOnly: true,
       
        secure : env.NODE_ENV === 'production', 
       
        sameSite:"none",
    })
    
    }
}