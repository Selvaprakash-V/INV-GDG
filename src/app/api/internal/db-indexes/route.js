import { withApi } from '@/server/core/http';
import { User } from '@/server/db/models/User';
import { Product } from '@/server/db/models/Product';
import { Purchase } from '@/server/db/models/Purchase';
import { Job } from '@/server/db/models/Job';

// Deploy-time: build declared indexes and drop obsolete ones (e.g. the old
// globally-unique barcode index). Authorization: Bearer $CRON_SECRET.
export const POST = withApi(
  async () => {
    const results = {};
    for (const model of [User, Product, Purchase, Job]) {
      results[model.modelName] = { dropped: await model.syncIndexes() };
    }
    return { results };
  },
  { cronAuth: true }
);
