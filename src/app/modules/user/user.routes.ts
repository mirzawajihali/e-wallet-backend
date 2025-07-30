import { Router } from "express";

import { createUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { ValidateRequest } from "../../middlewares/ValidateRequest";

const router = Router();

router.post("/register", ValidateRequest(createUserZodSchema), userController.createUser);

router.get("/", userController.getAllUsers);



export const userRoutes = router