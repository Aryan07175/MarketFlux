import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', authenticate, authorize(['SELLER', 'ADMIN']), createProduct);
router.put('/:id', authenticate, authorize(['SELLER', 'ADMIN']), updateProduct);
router.delete('/:id', authenticate, authorize(['SELLER', 'ADMIN']), deleteProduct);

export default router;
