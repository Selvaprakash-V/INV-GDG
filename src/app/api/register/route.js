import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

export const POST = withApi(
  async ({ request, container }) => {
    const user = await container.userService.register(await request.json());
    return { message: 'User registered successfully', user };
  },
  { rateLimit: { name: 'register', policy: RATE_LIMITS.REGISTER }, status: 201 }
);
