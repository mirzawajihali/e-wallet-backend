import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { userService } from "./user.services"  // Updated import to use singleton instance
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";



const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.createUser(req.body)  // Updated method call

    

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data : user,
    })
})

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.updateUserProfile(req.params.id, req.body);  // Fixed method name

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Updated Successfully",
        data: user,
    });
})

const promoteToAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const promotedUser = await userService.promoteToAgent(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User promoted to agent successfully",
        data: promotedUser,
    });
})

const promoteToAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const promotedUser = await userService.promoteToAdmin(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User promoted to admin successfully",
        data: promotedUser,
    });
})

const getAllAgents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await userService.getAllAgents(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Agents Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const result = await userService.getMe(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your profile Retrieved Successfully",
        data: result
    })
})

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await userService.getAllUsers(query as Record<string, string>);  // Updated method call

  
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})

export const userController = {
    createUser,
    updateUser,
    promoteToAgent,
    promoteToAdmin,   // Added the promoteToAdmin method
    getAllAgents,
    getAllUsers,
    getMe
}