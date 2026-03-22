import cron from 'node-cron';
import axios from 'axios';
import { prisma, io } from '../index';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export const updatePricesFromML = async (): Promise<void> => {
  console.log('Running dynamic pricing update from ML Model...');
  try {
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      if (product.views <= 0 && product.stock > 0) continue; // Skip if no interaction

      try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict-price`, {
          product_id: product.id
        });
        
        const { suggested_price } = response.data;
        
        if (suggested_price && suggested_price !== product.currentPrice) {
          await prisma.$transaction([
            prisma.product.update({
              where: { id: product.id },
              data: { 
                currentPrice: suggested_price, 
                views: 0 // Reset views after price adjustment cycle
              } 
            }),
            prisma.priceHistory.create({
              data: {
                productId: product.id,
                price: suggested_price
              }
            })
          ]);
          
          console.log(`Updated price for product ${product.name}: $${suggested_price}`);
          
          io.emit('price_updated', {
            productId: product.id,
            newPrice: suggested_price
          });
        }
      } catch (err) {
        console.error(`Error updating price for product ${product.id}`); // Muted stack trace for brevity
      }
    }
  } catch (error) {
    console.error('Failed to run pricing job', error);
  }
};

// Start the cron job
export const startPricingCron = () => {
  // Run every 1 minute for demonstration purposes! In production: '0 * * * *' (Every Hour)
  cron.schedule('*/1 * * * *', updatePricesFromML);
  console.log('Dynamic Pricing Cron Job started. Evaluating prices every 1 minute.');
};
