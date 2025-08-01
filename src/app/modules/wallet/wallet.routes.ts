import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { WalletControllers } from './wallet.controller';
import { ValidateRequest } from '../../middlewares/ValidateRequest';
import { walletValidation } from './wallet.validation';

const router = Router();

// User routes
router.get('/my-wallet', 
    checkAuth(Role.USER, Role.AGENT), 
    WalletControllers.getMyWallet
);

router.post('/add-money', 
    checkAuth(Role.USER), 
    ValidateRequest(walletValidation.addMoney), 
    WalletControllers.addMoney
);

router.post('/withdraw', 
    checkAuth(Role.USER), 
    ValidateRequest(walletValidation.withdraw), 
    WalletControllers.withdraw
);

router.post('/send-money', 
    checkAuth(Role.USER), 
    ValidateRequest(walletValidation.sendMoney), 
    WalletControllers.sendMoney
);

// Agent routes
router.post('/cash-in', 
    checkAuth(Role.AGENT), 
    ValidateRequest(walletValidation.cashIn), 
    WalletControllers.cashIn
);

router.post('/cash-out', 
    checkAuth(Role.AGENT), 
    ValidateRequest(walletValidation.cashOut), 
    WalletControllers.cashOut
);

// Admin routes
router.get('/all', 
    checkAuth(Role.ADMIN), 
    WalletControllers.getAllWallets
);

router.patch('/block/:walletId', 
    checkAuth(Role.ADMIN), 
    WalletControllers.blockWallet
);

router.patch('/unblock/:walletId', 
    checkAuth(Role.ADMIN), 
    WalletControllers.unblockWallet
);

export const WalletRoutes = router;