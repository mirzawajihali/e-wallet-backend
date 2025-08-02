import { env } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedMainAdmin = async () => {
    try{
        const isMainAdminExists = await User.findOne({  email : env.MAIN_ADMIN_EMAIL});
        if(isMainAdminExists) {
            console.log("Main Admin already exists");
            return;
        }

        const authProvider : IAuthProvider={
            provider: "credentials",
            providerId: env.MAIN_ADMIN_EMAIL as string, 
        }


        const hashedPassword = await bcryptjs.hash(env.MAIN_ADMIN_PASSWORD as string, Number(process.env.BCRYPT_SALT_ROUNDS));
        const payload : IUser = {
            name : "Main Admin",
            role : Role.ADMIN,
            email : env.MAIN_ADMIN_EMAIL as string,
            isVarified : true,
            auths : [authProvider],
            password : hashedPassword as string,}


        const MainAdmin = await User.create(payload);
        console.log("Main Admin seeded successfully:", MainAdmin.email);
    }
    catch (error) {
        console.log("Error seeding Main Admin:", error);
    }
}