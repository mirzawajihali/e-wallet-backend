import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { TransactionControllers } from './transaction.controller';

const router = Router();

// User/Agent routes
router.get('/my-transactions', 
    checkAuth(Role.USER, Role.AGENT), 
    TransactionControllers.getMyTransaction
);

router.get('/:transactionId', 
    checkAuth(Role.USER, Role.AGENT, Role.ADMIN), 
    TransactionControllers.getTransactionById
);

// Admin routes  
router.get('/', 
    checkAuth(Role.ADMIN), 
    TransactionControllers.getAllTransactions
);

router.get('/stats/overview', 
    checkAuth(Role.ADMIN), 
    TransactionControllers.getTransactionStats
);

export const TransactionRoutes = router;