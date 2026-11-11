import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { resetEnvCache } from '@/server/config/env';
import { connectDb, disconnectDb } from '@/server/db/connection';
import { createContainer } from '@/server/container';
import { MemoryCacheStore } from '@/server/cache/CacheStore';
import { User } from '@/server/db/models/User';
import { Product } from '@/server/db/models/Product';
import { Purchase } from '@/server/db/models/Purchase';
import { Job } from '@/server/db/models/Job';
import { ROLES } from '@/shared/constants';
import { MS_PER_DAY } from '@/shared/constants';

/** Single-node replica set: required for multi-document transactions. */
export async function startDb() {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  process.env.MONGODB_URI = replSet.getUri('trackit_test');
  process.env.NEXTAUTH_SECRET = 'integration-test-secret-123';
  process.env.MONGODB_AUTO_INDEX = 'true';
  resetEnvCache();
  await connectDb();
  await Promise.all([User, Product, Purchase, Job].map((m) => m.syncIndexes()));
  return replSet;
}

export async function stopDb(replSet) {
  await disconnectDb();
  await replSet?.stop();
}

export async function clearDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}

export function fakeNotifier({ failTimes = 0 } = {}) {
  let failures = 0;
  const sent = [];
  return {
    kind: 'fake',
    sent,
    async send(msg) {
      if (failures < failTimes) {
        failures += 1;
        throw new Error('provider down');
      }
      sent.push(msg);
    },
  };
}

export async function makeContainer(overrides = {}) {
  return createContainer({
    cacheStore: new MemoryCacheStore(),
    notifier: fakeNotifier(),
    defer: () => {},
    readPreference: () => 'primary',
    ...overrides,
  });
}

let seq = 0;
export async function seedUsers(c) {
  seq += 1;
  const reg = (role, name, extra = {}) =>
    c.userService.register({
      fullName: name,
      email: `${name.toLowerCase().replace(/\s/g, '')}${seq}@test.io`,
      password: 'Passw0rdXy',
      confirmPassword: 'Passw0rdXy',
      role,
      ...extra,
    });
  const [adminA, adminB, customer, customer2] = await Promise.all([
    reg(ROLES.ADMIN, 'Admin A', { shopName: 'Shop A' }),
    reg(ROLES.ADMIN, 'Admin B', { shopName: 'Shop B' }),
    reg(ROLES.CUSTOMER, 'Cust One'),
    reg(ROLES.CUSTOMER, 'Cust Two'),
  ]);
  return { adminA, adminB, customer, customer2 };
}

export const inDays = (d, now = new Date()) => new Date(now.getTime() + d * MS_PER_DAY);

export const productInput = (overrides = {}) => ({
  name: 'Milk',
  category: 'Dairy',
  price: 50,
  stock: 10,
  expiryDate: inDays(20).toISOString(),
  barcode: `BC-${Math.random().toString(36).slice(2, 10)}`,
  ...overrides,
});
