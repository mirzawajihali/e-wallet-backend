import { Response } from "express"
import { env } from "../config/env";

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie=(res : Response , tokenInfo : AuthTokens) =>{
    const isProduction = env.NODE_ENV === 'production';
    
    if(tokenInfo.refreshToken) {
        res.cookie('refreshToken', tokenInfo.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })
    }

    if(tokenInfo.accessToken) {
        res.cookie('accessToken', tokenInfo.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        })
    }
}