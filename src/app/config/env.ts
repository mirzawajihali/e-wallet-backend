import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    PORT: string,
    MONGO_URI: string ,
    NODE_ENV: 'development' | 'production' ,
    BCRYPT_SALT_ROUNDS?: string; 
    GOOGLE_CALLBACK_URL : string, GOOGLE_CLIENT_SECRET : string, GOOGLE_CLIENT_ID : string,
      JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES: string; 
    // Optional, as it may not be defined in all environments
}


const loadEnvVariables = () : EnvConfig => {
    const requiredEnvVars : string [] = ['PORT', 'MONGO_URI', 'NODE_ENV', 'BCRYPT_SALT_ROUNDS', "GOOGLE_CALLBACK_URL", "GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_ID", 'JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRES', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES'];

    requiredEnvVars.forEach((envVar) =>{
        if(!process.env[envVar]){
                  throw new Error(`Missing environment variable: ${envVar}`);

        }
    });

    return {
        PORT: process.env.PORT as string,
        MONGO_URI: process.env.MONGO_URI  as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string
    }
}

export const env = loadEnvVariables();