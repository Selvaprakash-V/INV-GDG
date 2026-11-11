import { ValidationError } from './errors';

// Offset pagination for bounded lists (products) and keyset/cursor pagination
// for append-heavy, unbounded lists (purchases/transactions).

export function offsetMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

/** Cursor encodes the sort key of the last item: (date, _id). */
export function encodeCursor(date, id) {
  return Buffer.from(JSON.stringify({ d: new Date(date).toISOString(), id: String(id) })).toString('base64url');
}

export function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const { d, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    const date = new Date(d);
    if (Number.isNaN(date.getTime()) || !/^[a-f0-9]{24}$/i.test(id)) throw new Error('bad cursor');
    return { date, id };
  } catch {
    throw new ValidationError('Invalid cursor');
  }
}

/**
 * Mongo filter for "items after cursor" when sorting by (field desc, _id desc).
 */
export function keysetFilter(field, cursor, toObjectId) {
  if (!cursor) return {};
  const oid = toObjectId(cursor.id);
  return {
    $or: [{ [field]: { $lt: cursor.date } }, { [field]: cursor.date, _id: { $lt: oid } }],
  };
}
