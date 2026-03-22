import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: { seller: { select: { name: true, email: true } } }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { priceHistory: { orderBy: { timestamp: 'asc' } } }
    });
    
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { views: { increment: 1 } }
      });
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, basePrice, stock, category, imageUrl } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        basePrice,
        currentPrice: basePrice, 
        stock,
        category,
        imageUrl,
        sellerId: req.user.id
      }
    });

    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: basePrice
      }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, stock, category, imageUrl } = req.body;
  
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product || product.sellerId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized to update this product' });
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, stock, category, imageUrl }
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product || product.sellerId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized to delete this product' });
      return;
    }
    
    await prisma.priceHistory.deleteMany({ where: { productId: Number(id) } });
    await prisma.product.delete({ where: { id: Number(id) } });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
