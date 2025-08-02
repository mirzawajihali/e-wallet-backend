import { Router } from "express";

import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { ValidateRequest } from "../../middlewares/ValidateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post("/register", ValidateRequest(createUserZodSchema), userController.createUser);
router.patch("/:id", ValidateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), userController.updateUser);
router.get("/",checkAuth("ADMIN"), userController.getAllUsers);



export const userRoutes = router