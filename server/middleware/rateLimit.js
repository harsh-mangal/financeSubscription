// Lightweight in-memory limiter (swap to Redis for prod)
const buckets = new Map();
export function rateLimit({ windowMs = 60_000, max = 60, keyer = (req)=>req.ip } = {}) {
  return (req, res, next) => {
    const key = keyer(req);
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, reset: now + windowMs };
    if (now > bucket.reset) { bucket.count = 0; bucket.reset = now + windowMs; }
    bucket.count++;
    buckets.set(key, bucket);
    if (bucket.count > max) return res.status(429).json({ error: "Too many requests" });
    next();
  };
}
