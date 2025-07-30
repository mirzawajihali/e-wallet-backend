import dotenv from 'dotenv';
import th from 'zod/v4/locales/th.cjs';

dotenv.config();

interface EnvConfig {
    PORT: string,
    MONGO_URI: string ,
    NODE_ENV: 'development' | 'production' ,
    BCRYPT_SALT_ROUNDS?: string; // Optional, as it may not be defined in all environments
}


const loadEnvVariables = () : EnvConfig => {
    const requiredEnvVars : string [] = ['PORT', 'MONGO_URI', 'NODE_ENV', 'BCRYPT_SALT_ROUNDS'];

    requiredEnvVars.forEach((envVar) =>{
        if(!process.env[envVar]){
                  throw new Error(`Missing environment variable: ${envVar}`);

        }
    });

    return {
        PORT: process.env.PORT as string,
    MONGO_URI: process.env.MONGO_URI  as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS

    }
}

export const env = loadEnvVariables();