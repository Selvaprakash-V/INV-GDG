import { withApi } from '@/server/core/http';
import { queryToObject } from '@/server/validation/schemas';
import { ROLES } from '@/shared/constants';

// GET /api/analytics?type=inventory|sales|expiry|predictive|spending&period=daily|weekly|monthly
export const GET = withApi(
  ({ user, query, container }) => container.analyticsService.run(user, queryToObject(query)),
  { roles: [ROLES.ADMIN, ROLES.CUSTOMER] }
);
