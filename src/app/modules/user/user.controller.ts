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

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await userService.getAllUsers(query as Record<string, string>);  // Updated method call

  
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})

export const userController = {
    createUser,
    updateUser,  // Added the missing updateUser method
    getAllUsers
}