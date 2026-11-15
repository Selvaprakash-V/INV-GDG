#!/usr/bin/env node
/**
 * Seeds 50 realistic supermarket products for a store admin.
 * Usage:
 *   node scripts/seed-store.mjs "<MONGODB_URI>" "Apple Supermarket"
 * or if MONGODB_URI is in process.env:
 *   node scripts/seed-store.mjs
 */

import mongoose from 'mongoose';

const DEFAULT_SHOP_NAME = 'Apple Supermarket';
const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;
const TARGET_SHOP = process.argv[3] || process.env.TARGET_SHOP || DEFAULT_SHOP_NAME;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is required.');
  console.error('Usage: node scripts/seed-store.mjs "<MONGODB_URI>" [shopName]');
  process.exit(1);
}

const now = new Date();
const inDays = (days) => new Date(now.getTime() + days * 864e5);

export const SAMPLE_PRODUCTS = [
  // Dairy (6)
  { name: 'Fresh Whole Milk 1L', category: 'Dairy', price: 2.99, stock: 45, daysToExpiry: 12, barcode: 'APP-DAIRY-001', description: 'Fresh farm-sourced whole milk, pasteurized and homogenized.' },
  { name: 'Organic Greek Yogurt 500g', category: 'Dairy', price: 4.50, stock: 20, daysToExpiry: 6, barcode: 'APP-DAIRY-002', description: 'Thick, creamy traditional strained Greek yogurt.' },
  { name: 'Cheddar Cheese Block 400g', category: 'Dairy', price: 5.99, stock: 35, daysToExpiry: 45, barcode: 'APP-DAIRY-003', description: 'Mature sharp cheddar aged 12 months.' },
  { name: 'Salted Butter 250g', category: 'Dairy', price: 3.79, stock: 28, daysToExpiry: 60, barcode: 'APP-DAIRY-004', description: 'Creamy salted churned farm butter.' },
  { name: 'Cottage Cheese 400g', category: 'Dairy', price: 3.29, stock: 4, daysToExpiry: 2, barcode: 'APP-DAIRY-005', description: 'High-protein, low-fat fresh curd cottage cheese.' },
  { name: 'Heavy Whipping Cream 250ml', category: 'Dairy', price: 2.89, stock: 15, daysToExpiry: -1, barcode: 'APP-DAIRY-006', description: '36% milk fat whipping cream.' },

  // Bakery (6)
  { name: 'Artisan Sourdough Loaf', category: 'Bakery', price: 4.20, stock: 12, daysToExpiry: 2, barcode: 'APP-BAKE-001', description: 'Naturally fermented crusty artisan sourdough bread.' },
  { name: 'Whole Wheat Pita 6-Pack', category: 'Bakery', price: 3.10, stock: 18, daysToExpiry: 5, barcode: 'APP-BAKE-002', description: 'Stone-ground 100% whole wheat pocket pitas.' },
  { name: 'Butter Croissants 4-Pack', category: 'Bakery', price: 5.50, stock: 8, daysToExpiry: 3, barcode: 'APP-BAKE-003', description: 'Flaky, golden French-style butter pastries.' },
  { name: 'Chocolate Chip Muffins 4-Pack', category: 'Bakery', price: 4.80, stock: 14, daysToExpiry: 4, barcode: 'APP-BAKE-004', description: 'Moist bakery-style muffins packed with Belgian chocolate chips.' },
  { name: 'Sesame Seed Bagels 6-Pack', category: 'Bakery', price: 3.99, stock: 22, daysToExpiry: 6, barcode: 'APP-BAKE-005', description: 'Chewy, New York-style boiled and baked bagels.' },
  { name: 'Cinnamon Swirl Bread', category: 'Bakery', price: 4.50, stock: 2, daysToExpiry: -2, barcode: 'APP-BAKE-006', description: 'Sweet breakfast loaf ribboned with real cinnamon sugar.' },

  // Produce (8)
  { name: 'Crisp Royal Gala Apples 1kg', category: 'Produce', price: 3.49, stock: 60, daysToExpiry: 14, barcode: 'APP-PROD-001', description: 'Sweet, crisp seasonal orchard-fresh apples.' },
  { name: 'Cavendish Bananas 1kg', category: 'Produce', price: 1.99, stock: 40, daysToExpiry: 4, barcode: 'APP-PROD-002', description: 'Naturally ripened, potassium-rich fresh bananas.' },
  { name: 'Organic Baby Spinach 250g', category: 'Produce', price: 2.99, stock: 16, daysToExpiry: 3, barcode: 'APP-PROD-003', description: 'Pre-washed, tender baby spinach leaves.' },
  { name: 'Vine-Ripened Roma Tomatoes 1kg', category: 'Produce', price: 3.20, stock: 25, daysToExpiry: 7, barcode: 'APP-PROD-004', description: 'Meaty plum tomatoes, ideal for cooking and salads.' },
  { name: 'Ripe Hass Avocados 3-Pack', category: 'Produce', price: 4.99, stock: 18, daysToExpiry: 3, barcode: 'APP-PROD-005', description: 'Creamy, rich ready-to-eat Haas avocados.' },
  { name: 'Crisp Baby Carrots 1kg', category: 'Produce', price: 1.79, stock: 30, daysToExpiry: 20, barcode: 'APP-PROD-006', description: 'Sweet, washed organic snacking carrots.' },
  { name: 'Yellow Onions Bag 1kg', category: 'Produce', price: 2.10, stock: 35, daysToExpiry: 30, barcode: 'APP-PROD-007', description: 'Pungent kitchen cooking staple brown onions.' },
  { name: 'English Continental Cucumbers', category: 'Produce', price: 1.50, stock: 3, daysToExpiry: 2, barcode: 'APP-PROD-008', description: 'Seedless, crisp thin-skinned salad cucumbers.' },

  // Meat (5)
  { name: 'Free-Range Chicken Breast 500g', category: 'Meat', price: 7.99, stock: 24, daysToExpiry: 3, barcode: 'APP-MEAT-001', description: 'Lean, skinless and boneless fresh chicken fillets.' },
  { name: 'Prime Lean Ground Beef 500g', category: 'Meat', price: 8.49, stock: 19, daysToExpiry: 4, barcode: 'APP-MEAT-002', description: '90% lean ground beef, freshly prepared daily.' },
  { name: 'Atlantic Salmon Fillet 400g', category: 'Meat', price: 12.99, stock: 10, daysToExpiry: 2, barcode: 'APP-MEAT-003', description: 'Responsibly farmed, omega-3 rich fresh salmon portions.' },
  { name: 'Smoked Streaky Bacon 250g', category: 'Meat', price: 5.99, stock: 20, daysToExpiry: 25, barcode: 'APP-MEAT-004', description: 'Naturally beechwood-smoked cured pork belly rashers.' },
  { name: 'Pork Tenderloin Cut 500g', category: 'Meat', price: 9.50, stock: 2, daysToExpiry: -3, barcode: 'APP-MEAT-005', description: 'Tender, juicy center-cut pork medallion.' },

  // Beverages (6)
  { name: 'Cold-Pressed Orange Juice 1L', category: 'Beverages', price: 3.99, stock: 30, daysToExpiry: 18, barcode: 'APP-BEV-001', description: '100% pure squeezed oranges with delicate pulp.' },
  { name: 'Organic Cold Brew Coffee 750ml', category: 'Beverages', price: 4.79, stock: 15, daysToExpiry: 22, barcode: 'APP-BEV-002', description: 'Steeped for 20 hours for an ultra-smooth, chocolatey profile.' },
  { name: 'Japanese Green Tea 50 Bags', category: 'Beverages', price: 5.20, stock: 40, daysToExpiry: 180, barcode: 'APP-BEV-003', description: 'Antioxidant-rich steamed sencha green tea.' },
  { name: 'Natural Sparkling Water 1.5L', category: 'Beverages', price: 1.89, stock: 50, daysToExpiry: 240, barcode: 'APP-BEV-004', description: 'Crisp mineral spring water with lively fine carbonation.' },
  { name: 'Almond Milk Unsweetened 1L', category: 'Beverages', price: 3.29, stock: 26, daysToExpiry: 45, barcode: 'APP-BEV-005', description: 'Plant-based creamy milk fortified with calcium and vitamins.' },
  { name: 'Pure Coconut Water 1L', category: 'Beverages', price: 4.29, stock: 20, daysToExpiry: 60, barcode: 'APP-BEV-006', description: 'Hydrating electrolyte-rich young green coconut water.' },

  // Snacks (6)
  { name: 'Sea Salt Kettle Potato Chips 150g', category: 'Snacks', price: 2.99, stock: 45, daysToExpiry: 90, barcode: 'APP-SNAK-001', description: 'Hand-cooked batch potato crisps with pink rock salt.' },
  { name: 'Roasted Salted Almonds 200g', category: 'Snacks', price: 6.49, stock: 25, daysToExpiry: 120, barcode: 'APP-SNAK-002', description: 'Slow-roasted whole California almonds.' },
  { name: 'Dark Chocolate 85% Cacao 100g', category: 'Snacks', price: 3.79, stock: 35, daysToExpiry: 180, barcode: 'APP-SNAK-003', description: 'Single-origin Swiss dark chocolate, rich and bitter.' },
  { name: 'Protein Granola Bars 6-Pack', category: 'Snacks', price: 4.19, stock: 30, daysToExpiry: 150, barcode: 'APP-SNAK-004', description: 'Chewy oats bar with peanut butter and roasted nuts.' },
  { name: 'Movie Theater Butter Popcorn 3-Pack', category: 'Snacks', price: 3.29, stock: 22, daysToExpiry: 110, barcode: 'APP-SNAK-005', description: 'Classic microwave popcorn with rich golden butter.' },
  { name: 'Medjool Dates & Walnut Mix 250g', category: 'Snacks', price: 4.99, stock: 18, daysToExpiry: 140, barcode: 'APP-SNAK-006', description: 'Energy-dense raw natural snack blend.' },

  // Canned Goods (6)
  { name: 'Organic Black Beans 400g', category: 'Canned Goods', price: 1.69, stock: 40, daysToExpiry: 365, barcode: 'APP-CANN-001', description: 'Tender black turtle beans in light sea salt brine.' },
  { name: 'Crushed San Marzano Tomatoes 400g', category: 'Canned Goods', price: 1.89, stock: 50, daysToExpiry: 400, barcode: 'APP-CANN-002', description: 'Authentic Italian sweet peeled plum tomatoes.' },
  { name: 'Yellowfin Tuna in Olive Oil 185g', category: 'Canned Goods', price: 2.49, stock: 35, daysToExpiry: 500, barcode: 'APP-CANN-003', description: 'Pole-and-line wild caught tuna in extra virgin olive oil.' },
  { name: 'Garbanzo Chickpeas 400g', category: 'Canned Goods', price: 1.59, stock: 30, daysToExpiry: 300, barcode: 'APP-CANN-004', description: 'Plump cooked chickpeas, ready for hummus or stews.' },
  { name: 'Sweet Golden Kernel Corn 400g', category: 'Canned Goods', price: 1.49, stock: 45, daysToExpiry: 360, barcode: 'APP-CANN-005', description: 'Naturally sweet crunch corn kernels picked at peak season.' },
  { name: 'Rich Coconut Cream 400ml', category: 'Canned Goods', price: 2.29, stock: 28, daysToExpiry: 280, barcode: 'APP-CANN-006', description: 'Extra thick coconut extract for curries and baking.' },

  // Frozen Foods (5)
  { name: 'Frozen Wild Berries Medley 500g', category: 'Frozen Foods', price: 5.49, stock: 20, daysToExpiry: 200, barcode: 'APP-FROZ-001', description: 'IQF frozen blueberries, raspberries, and blackberries.' },
  { name: 'Tender Sweet Garden Peas 1kg', category: 'Frozen Foods', price: 2.99, stock: 30, daysToExpiry: 180, barcode: 'APP-FROZ-002', description: 'Flash-frozen tender young peas locked with sweetness.' },
  { name: 'Stone-Baked Margherita Pizza 350g', category: 'Frozen Foods', price: 6.99, stock: 15, daysToExpiry: 120, barcode: 'APP-FROZ-003', description: 'Wood-fired sourdough crust topped with mozzarella and basil.' },
  { name: 'Bourbon Vanilla Bean Gelato 1L', category: 'Frozen Foods', price: 5.99, stock: 18, daysToExpiry: 90, barcode: 'APP-FROZ-004', description: 'Rich artisan ice cream with speckled real vanilla seeds.' },
  { name: 'Crispy Vegetable Spring Rolls 10-Pack', category: 'Frozen Foods', price: 4.89, stock: 14, daysToExpiry: 150, barcode: 'APP-FROZ-005', description: 'Crispy pastry rolls filled with shredded Asian vegetables.' },

  // Household (2)
  { name: '2-Ply Recycled Paper Towels 2-Pack', category: 'Household', price: 4.49, stock: 30, daysToExpiry: 700, barcode: 'APP-HOUS-001', description: 'Absorbent, durable kitchen paper rolls made from recycled pulp.' },
  { name: 'Eco Citrus Dishwashing Liquid 750ml', category: 'Household', price: 3.79, stock: 25, daysToExpiry: 500, barcode: 'APP-HOUS-002', description: 'Plant-based biodegradable grease-cutting dish detergent.' },

  // Personal Care (2)
  { name: 'Aloe & Chamomile Hand Wash 250ml', category: 'Personal Care', price: 3.19, stock: 25, daysToExpiry: 450, barcode: 'APP-CARE-001', description: 'Antibacterial soothing botanical liquid soap pump.' },
  { name: 'Nourishing Shea Butter Body Wash 500ml', category: 'Personal Care', price: 5.89, stock: 18, daysToExpiry: 380, barcode: 'APP-CARE-002', description: 'Hydrating shower gel rich in vitamin E and natural lipids.' },
];

async function seed() {
  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected successfully.`);

  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');
  const productsCollection = db.collection('products');

  // Find store admin by shopName or email
  const storeRegex = new RegExp(TARGET_SHOP.replace(/\s+/g, '\\s*'), 'i');
  let admin = await usersCollection.findOne({ shopName: storeRegex, role: 'Administrator' });

  if (!admin) {
    admin = await usersCollection.findOne({ email: /suriyaprakash/i, role: 'Administrator' });
  }

  if (!admin) {
    // If not found, list available admins
    const admins = await usersCollection.find({ role: 'Administrator' }).toArray();
    console.error(`Could not find administrator matching "${TARGET_SHOP}".`);
    console.log(`Available administrators in database (${admins.length}):`);
    admins.forEach((a) => console.log(` - ID: ${a._id}, Shop: "${a.shopName}", Email: "${a.email}"`));
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Found store: "${admin.shopName}" (Admin ID: ${admin._id}, Email: ${admin.email})`);

  let added = 0;
  let skipped = 0;

  for (const item of SAMPLE_PRODUCTS) {
    const { daysToExpiry, ...prod } = item;
    const expiryDate = inDays(daysToExpiry);

    // Upsert or insert if not exists by storeId + barcode
    const existing = await productsCollection.findOne({ storeId: admin._id, barcode: prod.barcode });
    if (existing) {
      skipped += 1;
      continue;
    }

    await productsCollection.insertOne({
      ...prod,
      storeId: admin._id,
      expiryDate,
      isActive: true,
      image: '/images/default-product.png',
      createdAt: now,
      updatedAt: now,
    });
    added += 1;
  }

  console.log(`\n======================================================`);
  console.log(`Seeding completed for "${admin.shopName}":`);
  console.log(` -> Products added:   ${added}`);
  console.log(` -> Products skipped: ${skipped} (already existed)`);
  console.log(` -> Total in catalog: ${added + skipped}`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
  console.log('Database disconnected.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
