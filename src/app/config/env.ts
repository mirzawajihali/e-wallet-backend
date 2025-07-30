import dotenv from 'dotenv';
import th from 'zod/v4/locales/th.cjs';

dotenv.config();

interface EnvConfig {
    PORT: string,
    MONGO_URI: string ,
    NODE_ENV: 'development' | 'production' ;
}


const loadEnvVariables = () : EnvConfig => {
    const requiredEnvVars : string [] = ['PORT', 'MONGO_URI', 'NODE_ENV'];

    requiredEnvVars.forEach((envVar) =>{
        if(!process.env[envVar]){
                  throw new Error(`Missing environment variable: ${envVar}`);

        }
    });

    return {
        PORT: process.env.PORT as string,
    MONGO_URI: process.env.MONGO_URI  as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    }
}

export const env = loadEnvVariables();