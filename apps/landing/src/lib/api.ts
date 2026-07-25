const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "https://dash-be.an-thiel.com";

export type ContactQueryRateLimit = {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterMinutes: number;
  resetAt: string | null;
};

export type CreateContactQueryResult =
  | { ok: true; id: string; remaining: number; resetAt: string | null }
  | { ok: false; status: number; retryAfterMinutes: number; resetAt: string | null; error: string };

export async function getContactQueryRateLimit(): Promise<ContactQueryRateLimit> {
  const response = await fetch(`${API_URL}/contact-queries/rate-limit`);
  if (!response.ok) {
    throw new Error("Failed to load rate limit");
  }
  const json = (await response.json()) as { data: ContactQueryRateLimit };
  return json.data;
}

export async function createContactQuery(input: {
  email: string;
  message: string;
}): Promise<CreateContactQueryResult> {
  const response = await fetch(`${API_URL}/contact-queries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await response.json()) as {
    data?: { id: string; remaining: number; resetAt: string | null };
    error?: string;
    retryAfterMinutes?: number;
    resetAt?: string | null;
  };

  if (response.status === 429) {
    return {
      ok: false,
      status: 429,
      retryAfterMinutes: json.retryAfterMinutes ?? 60,
      resetAt: json.resetAt ?? null,
      error: json.error ?? "Rate limit exceeded",
    };
  }

  if (!response.ok || !json.data) {
    return {
      ok: false,
      status: response.status,
      retryAfterMinutes: 0,
      resetAt: null,
      error: json.error ?? "Failed to send message",
    };
  }

  return {
    ok: true,
    id: json.data.id,
    remaining: json.data.remaining,
    resetAt: json.data.resetAt,
  };
}
