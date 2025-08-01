import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { WalletRoutes } from "../modules/wallet/wallet.routes";
import { TransactionRoutes } from "../modules/transaction/transaction.route";

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
   },
   {
      path: '/transactions',
      route : TransactionRoutes
   }
   
   
]


moduleRoutes.forEach(route => router.use(route.path, route.route));