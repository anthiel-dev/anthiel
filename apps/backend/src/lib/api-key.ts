const API_KEY_PREFIX = "ath_";

export function generateApiKey() {
  const secret = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const apiKey = `${API_KEY_PREFIX}${secret}`;
  return {
    apiKey,
    keyPrefix: apiKey.slice(0, 12),
    keyHash: hashApiKey(apiKey),
  };
}

export function hashApiKey(apiKey: string) {
  return new Bun.CryptoHasher("sha256").update(apiKey).digest("hex");
}

export function extractApiKeyFromHeaders(headers: Headers): string | null {
  const headerKey = headers.get("x-api-key")?.trim();
  if (headerKey) return headerKey;

  const authorization = headers.get("authorization")?.trim();
  if (!authorization) return null;

  const [scheme, token] = authorization.split(/\s+/, 2);
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}
