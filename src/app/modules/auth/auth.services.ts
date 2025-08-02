/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs"
import AppError from "../../errorHelpers/AppError";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/UserTokens";
import { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";

class AuthService {
    /**
     * Generates new access token using refresh token
     * Validates refresh token and creates fresh access token
     */
    async getNewAccessToken(refreshToken: string) {
        const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);
        
        console.log('✅ New access token generated successfully');
        return {
            accessToken: newAccessToken,
        }
    }

    /**
     * Resets user password after validating old password
     * Ensures security by requiring current password verification
     */
    async resetPassword(oldPassword: string, newPassword: string, decodedToken: JwtPayload) {
        // Find user by email from JWT token
        const user = await User.findOne({ email: decodedToken.email });
        
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        // Verify old password
        const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user.password as string);
        if (!isOldPasswordMatch) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
        }

        // Hash and save new password
        user.password = await bcryptjs.hash(newPassword, Number(env.BCRYPT_SALT_ROUNDS));
        await user.save();

        console.log(`✅ Password reset successful for user: ${user.email}`);
        return { message: "Password reset successfully" };
    }

    /**
     * Validates user credentials for login
     * Compares provided password with stored hash
     */
    async validateUserCredentials(email: string, password: string) {
        const user = await User.findOne({ email });
        
        if (!user) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password as string);
        if (!isPasswordValid) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        console.log(`✅ User credentials validated: ${email}`);
        return user;
    }

    /**
     * Generates authentication tokens for user
     * Creates both access and refresh tokens
     */
    async generateUserTokens(user: IUser) {
        const tokens = createUserTokens(user);
        
        console.log(`✅ Tokens generated for user: ${user.email}`);
        return tokens;
    }

    /**
     * Handles user logout (token invalidation would be implemented here)
     * In a production app, you'd invalidate tokens in a blacklist
     */
    async logout(userId: string) {
        // In a real application, you would:
        // 1. Add tokens to a blacklist/cache
        // 2. Update user's last logout time
        // 3. Clear any sessions
        
        console.log(`✅ User logged out: ${userId}`);
        return { message: "Logout successful" };
    }
}

// Export singleton instance
export const authService = new AuthService();