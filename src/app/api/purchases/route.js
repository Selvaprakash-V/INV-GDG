import { withApi } from '@/server/core/http';
import { queryToObject } from '@/server/validation/schemas';
import { RATE_LIMITS } from '@/server/config/constants';
import { ROLES } from '@/shared/constants';

// GET /api/purchases?limit=&cursor=&from=&to=  (keyset pagination; scoped to the caller)
export const GET = withApi(
  ({ user, query, container }) => container.purchaseService.list(user, queryToObject(query)),
  { roles: [ROLES.ADMIN, ROLES.CUSTOMER] }
);

// POST { customerEmail | customerId, items: [{ productId, quantity }], paymentMethod }
export const POST = withApi(
  async ({ user, request, container }) => {
    const purchase = await container.purchaseService.record(user, await request.json());
    return { message: 'Purchase recorded successfully', purchase };
  },
  { roles: [ROLES.ADMIN], rateLimit: { name: 'write', policy: RATE_LIMITS.WRITE }, status: 201 }
);
