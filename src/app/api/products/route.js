import { withApi } from '@/server/core/http';
import { queryToObject } from '@/server/validation/schemas';
import { RATE_LIMITS } from '@/server/config/constants';
import { ROLES } from '@/shared/constants';

const adminOnly = [ROLES.ADMIN];

// GET /api/products?page=&limit=&search=&category=&expiringWithinDays=&expiresFrom=&expiresTo=&sort=
export const GET = withApi(
  ({ user, query, container }) => container.productService.list(user, queryToObject(query)),
  { roles: adminOnly }
);

export const POST = withApi(
  async ({ user, request, container }) => {
    const product = await container.productService.create(user, await request.json());
    return { message: 'Product added successfully', product };
  },
  { roles: adminOnly, rateLimit: { name: 'write', policy: RATE_LIMITS.WRITE }, status: 201 }
);
