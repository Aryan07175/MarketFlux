import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/orderController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);

export default router;
