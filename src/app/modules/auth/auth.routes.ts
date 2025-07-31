import { NextFunction, Request, Response, Router } from "express";

import { Role } from "../user/user.interface";
import passport from "passport";
import { checkAuth } from "../../middlewares/checkAuth";
import { AuthControllers } from "./auth.controllers";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout)
router.post("/reset-password",checkAuth(...Object.values(Role)), AuthControllers.resetPassword)
router.get("/google", async(req : Request, res : Response, next : NextFunction)=>{
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
        scope: ["email", "profile"],
        state : redirect as string,
        session: false
    })(req, res, next);
});

router.get("/google/callback",passport.authenticate("google", {session: false,failureRedirect: "/login"}), AuthControllers.googleCallbackController);
export const AuthRoutes = router; 