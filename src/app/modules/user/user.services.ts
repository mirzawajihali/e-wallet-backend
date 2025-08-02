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


async updateUser(userId: string, payload: Partial<IUser>, decodedToken: { role: Role; user_id: string }) {
    const ifUserExist = await User.findById(userId);

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

   


    // Hash password if provided
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password as string, Number(env.BCRYPT_SALT_ROUNDS));
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    return newUpdateUser;
}
          

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

    /**
     * Promotes a user to AGENT role
     * Admin-only functionality to upgrade user permissions
     */
    async promoteToAgent(userId: string) {
        const objectId = new mongoose.Types.ObjectId(userId);
        
        // Find the user first to validate
        const user = await User.findById(objectId);
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        // Check if user is already an agent
        if (user.role === Role.AGENT) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is already an agent");
        }

        // Check if user is an admin (cannot demote admin to agent)
        if (user.role === Role.ADMIN) {
            throw new AppError(httpStatus.BAD_REQUEST, "Cannot demote admin to agent");
        }

        // Check if user account is active
        if (user.isActive !== 'ACTIVE') {
            throw new AppError(httpStatus.BAD_REQUEST, "Cannot promote inactive user to agent");
        }

        // Check if user account is deleted
        if (user.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "Cannot promote deleted user to agent");
        }

        // Update user role to AGENT
        const promotedUser = await User.findByIdAndUpdate(
            objectId,
            { role: Role.AGENT },
            { new: true }
        ).select('-password');

        if (!promotedUser) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        console.log(`🎉 User promoted to agent: ${promotedUser.email}`);
        return promotedUser;
    }

    /**
     * Retrieves all agents in the system
     * Admin-only functionality to view all agent accounts
     */
    async getAllAgents(query: Record<string, string>) {
        const queryBuilder = new QueryBuilder(
            User.find({ 
                role: Role.AGENT,
                isDeleted: false 
            }).select('-password'), 
            query
        );
        
        const agentsData = queryBuilder
            .filter()
            .search(['name', 'email'])
            .sort()
            .fields()
            .paginate();

        // Execute query and get metadata in parallel for better performance
        const [data, meta] = await Promise.all([
            agentsData.build(),
            queryBuilder.getMeta()
        ]);

        return { data, meta };
    }
}

// Export singleton instance
export const userService = new UserService();