import { Router } from "express";
import { ValidateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";

const router = Router();

router.post("/register", ValidateRequest(createUserZodSchema), userController.createUser);



export const userRoutes = router