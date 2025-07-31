import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";

export const router = Router();


const moduleRoutes =[
   
   {
    path: '/users',
    route: userRoutes
   },
   {
    path: '/auth',
    route: AuthRoutes
   }
   
   
]


moduleRoutes.forEach(route => router.use(route.path, route.route));