import { describe, it, expect } from 'vitest';
import { clientIp } from '@/server/core/http';

describe('clientIp', () => {
  it('prefers X-Real-IP set by the load balancer', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '6.6.6.6' }))).toBe('1.2.3.4');
  });

  it('uses the last X-Forwarded-For hop (first hop is spoofable)', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '6.6.6.6, 9.9.9.9' }))).toBe('9.9.9.9');
  });

  it('accepts plain header objects (next-auth authorize req)', () => {
    expect(clientIp({ 'x-forwarded-for': '5.5.5.5' })).toBe('5.5.5.5');
    expect(clientIp(undefined)).toBe('unknown');
  });
});
