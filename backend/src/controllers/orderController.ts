import { Request, Response } from 'express';
import { prisma, io } from '../index';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, quantity } = req.body;
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    if (product.stock < quantity) {
      res.status(400).json({ error: 'Not enough stock' });
      return;
    }

    const [order, updatedProduct] = await prisma.$transaction([
      prisma.order.create({
        data: {
          buyerId: req.user.id,
          productId: product.id,
          quantity,
          price: product.currentPrice
        }
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - quantity }
      })
    ]);

    // WebSocket event to broadcast new stock for dynamic UI
    io.emit('product_updated', {
      productId: product.id,
      stock: updatedProduct.stock,
      currentPrice: updatedProduct.currentPrice
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
