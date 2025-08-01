/* eslint-disable @typescript-eslint/no-unused-expressions */
import passport from "passport";
import { Strategy as googleStrategy, Profile, VerifyCallback} from "passport-google-oauth20";
import { env } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy  as LocalStrategy} from "passport-local";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done: any) => {
        try {
            const isUserExist = await User.findOne({ email });
            if (!isUserExist) {
             
                return done(null, false, { message: "User not found" });
            }

            const isGoogleAuthenticated = isUserExist.auths.some(auth => auth.provider === "google");

            if (isGoogleAuthenticated && !isUserExist.password) {
                return done(null, false, { 
                    message: "Your account is connected with Google. Please login with Google." 
                });
            }

            const isPasswordMatched = await bcryptjs.compare(password, isUserExist.password as string);

            if (!isPasswordMatched) {
                
                return done(null, false, { message: "Invalid password" });
            }

            return done(null, isUserExist);

        } catch (error) {
            return done(error);
        }
    })
);







passport.use(
    new googleStrategy({
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: env.GOOGLE_CALLBACK_URL as string,
        passReqToCallback: true
    }, async(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: any,
        accessToken: string,
        refreshToken: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: any,
        profile: Profile,
        done: VerifyCallback
    ) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(null, false, { message: "No email found in Google profile" });
            }

            let user = await User.findOne({email});
            if(!user){
                // Import necessary modules for wallet creation
                const mongoose = require('mongoose');
                const { Wallet } = require('../modules/wallet/wallet.model');
                
                const session = await mongoose.startSession();
                
                try {
                    session.startTransaction();
                    
                    // Create user
                    const [newUser] = await User.create([{
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0]?.value,
                        role: Role.USER,
                        isVarified: true,
                        auths: [{
                            provider: "google",
                            providerId: profile.id
                        }]
                    }], { session });

                    // Create wallet for Google user
                    await Wallet.create([{
                        userId: newUser._id,
                        balance: 50,
                        isBlocked: false
                    }], { session });

                    await session.commitTransaction();
                    user = newUser;
                    console.log(`✅ Google user created with wallet: ${email}`);
                    
                } catch (error) {
                    await session.abortTransaction();
                    console.error('❌ Google user creation failed:', error);
                    throw error;
                } finally {
                    session.endSession();
                }
            }
            return done(null, user);

        } catch (error) {
            console.log("Error in Google Strategy:", error);
            return done(error);
        }
    })
)
