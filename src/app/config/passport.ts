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
        usernameField : "email",
        passwordField : "password"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, async(email: string, password: string, done: any)=>{
        try{
            const isUserExist = await User.findOne({email}) ;
            if(!isUserExist){
                return done("User not found");
            }

            const isGoogleAuthenticated = isUserExist.auths.some(auth => auth.provider === "google");

            if(isGoogleAuthenticated && !isUserExist.password){
                return done(null, false, {message : "your account is connected with Google. Please login with Google. If you want to login with credentials then login with google then set a password for your gmail "});
            }
            
            const isPassWordMatched = await bcryptjs.compare(password as string, isUserExist.password as string);
    

         if(!isPassWordMatched){
                    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid passward (doesnt match)");
    }

    return done(null, isUserExist);
        
}
        catch(error){
            done(error);
        }
    })
)







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
                user = await User.create({
                    email,
                    name: profile.displayName ,
                    picture : profile.photos?.[0]?.value,
                    role : Role.USER,
                    isVarified: true,
                    auths :[
                        {
                            provider : "google",
                            providerId : profile.id
                        }
                    ]
            })

            
        }
        return done(null, user);
    }

        catch (error) {
            console.log("Error in Google Strategy:", error);
            return done(error);
        }
        
    }
))

// Since we're using session: false, we don't need serialize/deserialize
// Remove or comment out the following:

// passport.serializeUser((user : any, done : (err : any, id ?: unknown) => void) => {
//     done(null, user._id);
// });

// passport.deserializeUser(async (id : string, done :  any) => {
//     try{
//         const user = await User.findById(id);
//         done(null, user);
//     }
//     catch(error){
//         done(error);
//     }
// })