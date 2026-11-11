import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';
import { ROLES } from '@/shared/constants';

const adminOnly = [ROLES.ADMIN];
const write = { name: 'write', policy: RATE_LIMITS.WRITE };

export const GET = withApi(
  async ({ user, params, container }) => ({ product: await container.productService.get(user, params.id) }),
  { roles: adminOnly }
);

export const PUT = withApi(
  async ({ user, params, request, container }) => {
    const product = await container.productService.update(user, params.id, await request.json());
    return { message: 'Product updated successfully', product };
  },
  { roles: adminOnly, rateLimit: write }
);

export const DELETE = withApi(
  async ({ user, params, container }) => {
    await container.productService.remove(user, params.id);
    return { message: 'Product deleted successfully' };
  },
  { roles: adminOnly, rateLimit: write }
);
