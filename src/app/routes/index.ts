import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { WalletRoutes } from "../modules/wallet/wallet.routes";

export const router = Router();


const moduleRoutes =[
   
   {
    path: '/users',
    route: userRoutes
   },
   {
    path: '/auth',
    route: AuthRoutes
   },

   {
    path: '/wallets',
    route: WalletRoutes
   }
   
   
]


moduleRoutes.forEach(route => router.use(route.path, route.route));