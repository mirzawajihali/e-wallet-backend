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
                    balance: 50,
                    isBlocked: false
                }], { session });
            }

            await session.commitTransaction();
            return newUser;

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
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

    
    async getUserByEmail(email: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }
        return user;
    }

    async getUserById(userId: string) {
        const objectId = new mongoose.Types.ObjectId(userId);
        const user = await User.findById(objectId).select('-password');
        
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }
        return user;
    }

   
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

        return updatedUser;
    }

    
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
     * Promotes a user to ADMIN role
     * Super Admin functionality to grant admin permissions
     */
    async promoteToAdmin(userId: string) {
        const objectId = new mongoose.Types.ObjectId(userId);
        
        // Find the user first to validate
        const user = await User.findById(objectId);
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        // Check if user is already an admin
        if (user.role === Role.ADMIN) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is already an admin");
        }

        // Check if user account is active
        if (user.isActive !== 'ACTIVE') {
            throw new AppError(httpStatus.BAD_REQUEST, "Cannot promote inactive user to admin");
        }

        // Check if user account is deleted
        if (user.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "Cannot promote deleted user to admin");
        }

        // Update user role to ADMIN
        const promotedUser = await User.findByIdAndUpdate(
            objectId,
            { role: Role.ADMIN },
            { new: true }
        ).select('-password');

        if (!promotedUser) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        console.log(`👑 User promoted to admin: ${promotedUser.email}`);
        return promotedUser;
    }


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

       
        const [data, meta] = await Promise.all([
            agentsData.build(),
            queryBuilder.getMeta()
        ]);

        return { data, meta };
    }
}

// Export singleton instance
export const userService = new UserService();