import { Types } from "mongoose";

export enum Role {
    
    ADMIN = "ADMIN",
    AGENT = "AGENT",
    USER = "USER"
    
}

export enum isActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}






export interface IAuthProvider {
    provider : "google" | "credentials";
    providerId : string;
}


export interface IUser {
    _id ?: Types.ObjectId;
    name : string;
    email : string;
    password ?: string;
    phone ?: string;
    picture ?: string;
    address ?: string;
    isDeleted ?: boolean;
    isActive ?: isActive;
    isVarified ?: boolean;
    auths : IAuthProvider[];
    role : Role;
    transactions ?: Types.ObjectId[];
    

}