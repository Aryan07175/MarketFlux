import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
  // Electronics
  { name: 'Apple iPhone 15 Pro Max', description: '6.7-inch Super Retina XDR, A17 Pro chip, 48MP camera, Titanium design, 256GB', basePrice: 159900, stock: 42, category: 'Smartphones', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop', views: 580 },
  { name: 'Samsung Galaxy S24 Ultra', description: '6.8-inch Dynamic AMOLED, Snapdragon 8 Gen 3, 200MP camera, S Pen included', basePrice: 129999, stock: 30, category: 'Smartphones', imageUrl: 'https://images.unsplash.com/photo-1707898535963-89bc40ea3f4f?w=600&auto=format&fit=crop', views: 420 },
  { name: 'OnePlus 12 5G', description: '6.82-inch LTPO AMOLED, Snapdragon 8 Gen 3, 50MP Hasselblad triple camera, 100W charging', basePrice: 64999, stock: 60, category: 'Smartphones', imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop', views: 290 },
  { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading ANC, 30hr battery, multipoint connection, Hi-Res Audio', basePrice: 29990, stock: 25, category: 'Audio', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop', views: 340 },
  { name: 'Apple MacBook Pro M3', description: '14-inch Liquid Retina XDR, Apple M3 Pro chip, 18GB RAM, 512GB SSD, 18hr battery', basePrice: 198900, stock: 15, category: 'Laptops', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop', views: 490 },
  { name: 'Dell XPS 15 OLED', description: 'Intel Core i7-13700H, 32GB DDR5, NVIDIA RTX 4060, 3.5K OLED Touch, 1TB SSD', basePrice: 149990, stock: 18, category: 'Laptops', imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop', views: 200 },
  { name: 'Apple iPad Pro 12.9"', description: 'M2 chip, Liquid Retina XDR, Thunderbolt, Wi-Fi 6E, 256GB', basePrice: 112900, stock: 22, category: 'Tablets', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop', views: 310 },
  { name: 'Sony Alpha A7 IV Mirrorless Camera', description: '33MP full-frame BSI CMOS, 4K 60fps, 5-axis image stabilization, hybrid AF', basePrice: 234990, stock: 8, category: 'Cameras', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop', views: 180 },
  { name: 'LG C3 65" OLED 4K TV', description: 'Self-lit OLED evo, A9 AI Processor Gen6, Dolby Vision IQ & Atmos, 120Hz', basePrice: 176990, stock: 12, category: 'TVs', imageUrl: 'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=600&auto=format&fit=crop', views: 260 },
  { name: 'Samsung 980 Pro NVMe SSD 2TB', description: 'PCIe 4.0, up to 7000 MB/s read, M.2 2280, compatible with PS5', basePrice: 18999, stock: 100, category: 'Storage', imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop', views: 150 },
  { name: 'Apple Watch Ultra 2', description: '49mm Titanium, GPS + Cellular, S9 SiP, Alpine/Ocean/Trail Loop, IP6X', basePrice: 89900, stock: 30, category: 'Wearables', imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop', views: 380 },
  { name: 'Logitech MX Master 3S Mouse', description: 'Ultra-fast Mag Speed scrolling, BluetoothSilent clicks, USB-C, works on glass', basePrice: 9995, stock: 80, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop', views: 220 },

  // Fashion
  { name: 'Nike Air Max 270 React', description: 'Max Air cushioning, React foam midsole, lightweight breathable mesh upper, Men\'s', basePrice: 12999, stock: 55, category: 'Footwear', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop', views: 410 },
  { name: 'Levi\'s 511 Slim Fit Jeans', description: 'Slim from hip to ankle, authentic stretch denim, flexible comfort', basePrice: 3999, stock: 120, category: 'Men\'s Fashion', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop', views: 290 },
  { name: 'Ray-Ban Aviator Classic', description: 'Crystal lenses, anti-reflective coating, metal frame, 100% UV protection', basePrice: 7800, stock: 45, category: 'Eyewear', imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop', views: 330 },
  { name: 'Casio G-Shock GA-2100', description: 'Carbon Core Guard, Shock/water resistant 200m, World Time, LED', basePrice: 8495, stock: 65, category: 'Watches', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop', views: 270 },
  { name: 'FabIndia Cotton Kurti (Set of 3)', description: 'Hand block printed, breathable cotton, festive & casual wear, S-XL', basePrice: 2999, stock: 200, category: 'Women\'s Fashion', imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop', views: 490 },
  { name: 'Wildcraft Alpha 40L Backpack', description: '40L capacity, laptop sleeve, rain cover included, trek-ready design', basePrice: 3499, stock: 75, category: 'Bags', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop', views: 210 },

  // Home & Kitchen
  { name: 'Instant Pot Duo 7-in-1', description: 'Pressure cooker, slow cooker, saute, steam, yogurt, 6 Quart, 13 smart programs', basePrice: 9499, stock: 40, category: 'Kitchen Appliances', imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop', views: 350 },
  { name: 'Dyson V15 Detect Cordless Vacuum', description: 'Laser detects hidden dust, 60min runtime, HEPA filtration, acoustic sensor', basePrice: 52900, stock: 20, category: 'Home Appliances', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop', views: 280 },
  { name: 'Samaroh Brass Diya Set (Pack of 12)', description: 'Handcrafted pure brass, traditional Indian design, ideal for pooja & décor', basePrice: 1299, stock: 500, category: 'Home Decor', imageUrl: 'https://images.unsplash.com/photo-1605513524006-063ed6ed31e7?w=600&auto=format&fit=crop', views: 180 },
  { name: 'Wonderchef Nutri-Blend', description: '22000 RPM powerful blending, 400W motor, stainless steel blades, 2 jars', basePrice: 3995, stock: 90, category: 'Kitchen Appliances', imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop', views: 400 },
  { name: 'Milton Thermosteel 1L Flask', description: 'Double-wall stainless steel, 24hr hot & 24hr cold, BPA-free, leak-proof', basePrice: 1099, stock: 300, category: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop', views: 160 },

  // Books & Stationery
  { name: 'Atomic Habits - James Clear', description: 'Tiny changes, remarkable results. #1 NYT Bestseller on building good habits', basePrice: 599, stock: 500, category: 'Books', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop', views: 620 },
  { name: 'Pilot FriXion Erasable Pen (Set of 12)', description: 'Heat-sensitive erasable ink, smooth writing, fine tip 0.7mm, assorted colors', basePrice: 1499, stock: 250, category: 'Stationery', imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&auto=format&fit=crop', views: 140 },

  // Sports & Fitness
  { name: 'Decathlon Artengo TR 990 Racket', description: 'Mid flex 100% graphite, 290g, strung with Babolat VS Touch for club players', basePrice: 5999, stock: 35, category: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1545809074-59472b3f5ecc?w=600&auto=format&fit=crop', views: 230 },
  { name: 'Powermax Fitness Cycle TDA-230S', description: '6-level magnetic resistance, 8kg flywheel, foldable, tablet holder, LCD display', basePrice: 18499, stock: 22, category: 'Fitness', imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&auto=format&fit=crop', views: 310 },
  { name: 'Nivia Combat Football (Size 5)', description: 'FIFA quality pro, 32 panel hand-stitched, match quality, all-weather durable', basePrice: 1299, stock: 150, category: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop', views: 200 },

  // Beauty & Personal Care
  { name: 'Mamaearth Tea Tree Face Wash', description: 'For acne-prone skin, 99% natural ingredients, removes excess oil, 200ml', basePrice: 299, stock: 600, category: 'Skincare', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop', views: 510 },
  { name: 'Dyson Airwrap Multi-Styler', description: 'No extreme heat, styles, waves, curls & dries hair, multiple attachments', basePrice: 45900, stock: 15, category: 'Hair Care', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop', views: 450 },

  // Gaming
  { name: 'PlayStation 5 Console', description: 'Ultra-high speed SSD, 4K gaming, Ray Tracing, PlayStation exclusive titles', basePrice: 54990, stock: 10, category: 'Gaming', imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&auto=format&fit=crop', views: 870 },
  { name: 'ASUS ROG Strix Scope RX TKL', description: 'ROG RX optical switches, Tenkeyless, aura sync RGB, aircraft-grade aluminum', basePrice: 12999, stock: 28, category: 'Gaming', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop', views: 340 },
];

async function main() {
  // Clear existing data
  await prisma.priceHistory.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  const seller = await prisma.user.create({
    data: {
      email: 'seller@pricepulse.ai',
      password: hashedPassword,
      name: 'PricePulse Official Store',
      role: 'SELLER',
    },
  });

  await prisma.user.create({
    data: {
      email: 'buyer@pricepulse.ai',
      password: hashedPassword,
      name: 'Test Buyer',
      role: 'BUYER',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@pricepulse.ai',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  for (const p of products) {
    // Slight variation so prices aren't exactly basePrice for interesting charts
    const startPrice = p.basePrice * (0.95 + Math.random() * 0.1);
    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        currentPrice: parseFloat(startPrice.toFixed(2)),
        stock: p.stock,
        category: p.category,
        imageUrl: p.imageUrl,
        sellerId: seller.id,
        views: p.views,
      },
    });

    // Seed a realistic-looking 6-point price history
    const pricePoints = [
      p.basePrice * (0.92 + Math.random() * 0.08),
      p.basePrice * (0.95 + Math.random() * 0.1),
      p.basePrice * (0.97 + Math.random() * 0.06),
      p.basePrice * (0.99 + Math.random() * 0.12),
      p.basePrice * (0.95 + Math.random() * 0.08),
      startPrice,
    ];

    for (let i = 0; i < pricePoints.length; i++) {
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: parseFloat(pricePoints[i].toFixed(2)),
          timestamp: new Date(Date.now() - (pricePoints.length - i) * 2 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log(`Seeded ${products.length} products with price history!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
