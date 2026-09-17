const rateLimit = new Map<string, { count: number; expiresAt: number }>();

/**
 * Verifica rate limit por chave (geralmente IP).
 * @param key   Identificador (IP, userId, etc.)
 * @param limit Máximo de requisições na janela
 * @param windowMs Janela de tempo em milissegundos
 * @returns true se permitido, false se excedeu o limite
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = rateLimit.get(key);

  if (!record || record.expiresAt < now) {
    rateLimit.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
