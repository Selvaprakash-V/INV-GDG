import { NotFoundError } from '../core/errors';
import { offsetMeta } from '../core/pagination';
import { CACHE_TTL_SECONDS, EVENTS } from '../config/constants';
import { cacheNamespaces } from '../cache/CacheService';
import {
  parse,
  productCreateSchema,
  productUpdateSchema,
  productListQuerySchema,
  idParamSchema,
} from '../validation/schemas';

/** Product use-cases for a store administrator. Every method is scoped to the caller's store. */
export class ProductService {
  constructor({ productRepository, cache, events }) {
    this.products = productRepository;
    this.cache = cache;
    this.events = events;
  }

  async list(user, query) {
    const q = parse(productListQuerySchema, query);
    // Cached per store + normalised query; invalidated by product/purchase events.
    return this.cache.wrap(cacheNamespaces.store(user.id), `products:${stableKey(q)}`, CACHE_TTL_SECONDS.PRODUCT_LIST, async () => {
      const { items, total } = await this.products.list({ storeId: user.id, ...q });
      return { products: items, pagination: offsetMeta({ page: q.page, limit: q.limit, total }) };
    });
  }

  async get(user, id) {
    parse(idParamSchema, { id });
    const product = await this.cache.wrap(cacheNamespaces.store(user.id), `product:${id}`, CACHE_TTL_SECONDS.PRODUCT, () =>
      this.products.findForStore(id, user.id)
    );
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async create(user, input) {
    const data = parse(productCreateSchema, input);
    const product = await this.products.create({ ...data, storeId: user.id });
    await this.#changed(user.id, product.id, 'created');
    return product;
  }

  async update(user, id, input) {
    parse(idParamSchema, { id });
    const patch = parse(productUpdateSchema, input);
    const product = await this.products.update(id, user.id, patch);
    if (!product) throw new NotFoundError('Product');
    await this.#changed(user.id, id, 'updated');
    return product;
  }

  async remove(user, id) {
    parse(idParamSchema, { id });
    const removed = await this.products.softDelete(id, user.id);
    if (!removed) throw new NotFoundError('Product');
    await this.#changed(user.id, id, 'deleted');
  }

  #changed(storeId, productId, action) {
    return this.events.emit(EVENTS.PRODUCT_CHANGED, { storeId, productId, action });
  }
}

/** Deterministic cache key for a parsed query (sorted keys, dates as ISO). */
export function stableKey(q) {
  return Object.keys(q)
    .sort()
    .filter((k) => q[k] !== undefined)
    .map((k) => `${k}=${q[k] instanceof Date ? q[k].toISOString() : q[k]}`)
    .join('&');
}
