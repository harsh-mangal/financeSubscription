export function parseCursorQuery(req, fallbackLimit = 20, maxLimit = 100) {
  const limit = Math.min(Number(req.query.limit || fallbackLimit), maxLimit);
  const cursor = req.query.cursor || null; // use createdAt ISO or _id
  return { limit, cursor };
}
