const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

const attempts = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now - entry.windowStart >= WINDOW_MS) attempts.delete(key);
  }
}

setInterval(cleanup, 60_000);

export function recordFailure(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

export function isRateLimited(ip) {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.windowStart >= WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function clearFailures(ip) {
  attempts.delete(ip);
}
