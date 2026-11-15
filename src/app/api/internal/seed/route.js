import { withApi } from '@/server/core/http';
import { Product } from '@/server/db/models/Product';
import { User } from '@/server/db/models/User';
import { cacheNamespaces } from '@/server/cache/CacheService';
import { SAMPLE_PRODUCTS } from '../../../../../scripts/seed-store.mjs';

async function run({ request, query, container }) {
  const urlShop = query.get('shop');
  let bodyShop;
  try {
    const body = await request.json();
    bodyShop = body?.shopName;
  } catch {
    /* empty body */
  }

  const target = urlShop || bodyShop || 'Apple Supermarket';
  const rx = new RegExp(target.replace(/\s+/g, '\\s*'), 'i');

  let admin = await User.findOne({ shopName: rx, role: 'Administrator' }).lean();
  if (!admin) {
    admin = await User.findOne({ email: /suriyaprakash/i, role: 'Administrator' }).lean();
  }

  if (!admin) {
    const list = await User.find({ role: 'Administrator' }).select('shopName email').lean();
    return {
      success: false,
      message: `Administrator for "${target}" not found`,
      availableStores: list.map((u) => ({ id: u._id, shopName: u.shopName, email: u.email })),
    };
  }

  const now = new Date();
  const inDays = (d) => new Date(now.getTime() + d * 864e5);

  let added = 0;
  let skipped = 0;

  for (const item of SAMPLE_PRODUCTS) {
    const { daysToExpiry, ...prod } = item;
    const exists = await Product.findOne({ storeId: admin._id, barcode: prod.barcode });
    if (exists) {
      skipped += 1;
      continue;
    }
    await Product.create({
      ...prod,
      storeId: admin._id,
      expiryDate: inDays(daysToExpiry),
      isActive: true,
      image: '/images/default-product.png',
    });
    added += 1;
  }

  await container.cache.invalidate(cacheNamespaces.store(String(admin._id)));

  return {
    success: true,
    message: `Seeded products for ${admin.shopName}`,
    store: { id: String(admin._id), shopName: admin.shopName },
    added,
    skipped,
    total: added + skipped,
  };
}

export const GET = withApi(run, { cronAuth: true });
export const POST = withApi(run, { cronAuth: true });
