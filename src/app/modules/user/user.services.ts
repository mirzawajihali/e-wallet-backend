import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from  "http-status-codes"
import bcryptjs from "bcryptjs";
import { env } from "../../config/env";
import { userSearchableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/QuaryBuilder";
import mongoose from "mongoose";
import { Wallet } from "../wallet/wallet.model";

class UserService {
    /**
     * Creates a new user with automatic wallet creation for USER and AGENT roles
     * Uses database transactions to ensure data consistency
     */
    async createUser(payload: Partial<IUser>) {
        const { email, password, ...rest } = payload;
        
        // Check if user already exists
        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User already exist");
        }

        const session = await mongoose.startSession();
        
        try {
            session.startTransaction();

            // Hash password for security
            const hashedPassword = await bcryptjs.hash(password as string, Number(env.BCRYPT_SALT_ROUNDS));

            // Create authentication provider object
            const authProvider: IAuthProvider = { 
                provider: "credentials", 
                providerId: email as string 
            };

            // Create user (returns array, so destructure first element)
            const [newUser] = await User.create([{
                email,
                password: hashedPassword,
                auths: [authProvider],
                ...rest
            }], { session });

            // Auto-create wallet for USER and AGENT roles
            if (newUser.role === Role.USER || newUser.role === Role.AGENT) {
                await Wallet.create([{
                    userId: newUser._id,
                    balance: 50, // Initial bonus ৳50
                    isBlocked: false
                }], { session });
                
                console.log(`🎉 Wallet created for ${newUser.role}: ${newUser.email}`);
            }

            // Commit transaction if everything succeeds
            await session.commitTransaction();
            console.log(`✅ User created successfully: ${newUser.email}`);
            
            return newUser;

        } catch (error) {
            // Rollback transaction on any error
            await session.abortTransaction();
            console.error('❌ User creation failed:', error);
            throw error;
        } finally {
            // Always close session
            session.endSession();
        }
    }

    /**
     * Retrieves all users with advanced filtering, searching, sorting, and pagination
     * Supports query parameters for flexible data retrieval
     */
    async getAllUsers(query: Record<string, string>) {
        const queryBuilder = new QueryBuilder(User.find(), query);
        
        const usersData = queryBuilder
            .filter()
            .search(userSearchableFields)
            .sort()
            .fields()
            .paginate();

        // Execute query and get metadata in parallel for better performance
        const [data, meta] = await Promise.all([
            usersData.build(),
            queryBuilder.getMeta()
        ]);

        return { data, meta };
    }

    /**
     * Finds a user by email address
     * Useful for authentication and user lookup operations
     */
    async getUserByEmail(email: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }
        return user;
    }

    /**
     * Finds a user by ID
     * Returns user without sensitive information like password
     */
    async getUserById(userId: string) {
        const objectId = new mongoose.Types.ObjectId(userId);
        const user = await User.findById(objectId).select('-password');
        
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }
        return user;
    }

    /**
     * Updates user profile information
     * Excludes sensitive fields like password and authentication data
     */
    async updateUserProfile(userId: string, updateData: Partial<IUser>) {
        const objectId = new mongoose.Types.ObjectId(userId);
        
        // Remove sensitive fields that shouldn't be updated directly
        const { password, auths, _id, ...allowedUpdates } = updateData;
        
        const updatedUser = await User.findByIdAndUpdate(
            objectId,
            allowedUpdates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        console.log(`✅ User profile updated: ${updatedUser.email}`);
        return updatedUser;
    }

    /**
     * Soft delete user account
     * Marks user as deleted instead of permanently removing from database
     */
    async deleteUser(userId: string) {
        const objectId = new mongoose.Types.ObjectId(userId);
        
        const deletedUser = await User.findByIdAndUpdate(
            objectId,
            { isDeleted: true },
            { new: true }
        ).select('-password');

        if (!deletedUser) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        console.log(`🗑️ User account deleted: ${deletedUser.email}`);
        return deletedUser;
    }

    /**
     * Block/unblock user account
     * Admin functionality to manage user access
     */
    async toggleUserBlock(userId: string, isBlocked: boolean) {
        const objectId = new mongoose.Types.ObjectId(userId);
        
        const updatedUser = await User.findByIdAndUpdate(
            objectId,
            { isActive: isBlocked ? 'BLOCKED' : 'ACTIVE' },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        const action = isBlocked ? 'blocked' : 'unblocked';
        console.log(`🔒 User ${action}: ${updatedUser.email}`);
        
        return updatedUser;
    }
}

// Export singleton instance
export const userService = new UserService();