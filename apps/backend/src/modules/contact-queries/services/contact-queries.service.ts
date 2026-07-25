import { and, asc, eq, gte } from "drizzle-orm";

import type { AppDb } from "@/database";

import { contactQueries } from "@/database/schema";

import type { CreateContactQueryBody } from "../contracts/request.contract";
import type { ContactQueryRateLimit } from "../contracts/response.contract";

import { CONTACT_QUERY_RATE_LIMIT, CONTACT_QUERY_WINDOW_MS } from "../constants";

function newId() {
  return crypto.randomUUID();
}

function minutesUntil(date: Date) {
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / 60_000));
}

export class ContactQueriesService {
  constructor(private readonly deps: { db: AppDb }) {}

  async getRateLimit(ip: string): Promise<ContactQueryRateLimit> {
    const windowStart = new Date(Date.now() - CONTACT_QUERY_WINDOW_MS);
    const recent = await this.deps.db
      .select({
        id: contactQueries.id,
        createdAt: contactQueries.createdAt,
      })
      .from(contactQueries)
      .where(and(eq(contactQueries.ip, ip), gte(contactQueries.createdAt, windowStart)))
      .orderBy(asc(contactQueries.createdAt));

    const used = recent.length;
    const remaining = Math.max(0, CONTACT_QUERY_RATE_LIMIT - used);

    if (used < CONTACT_QUERY_RATE_LIMIT) {
      return {
        allowed: true,
        remaining,
        limit: CONTACT_QUERY_RATE_LIMIT,
        retryAfterMinutes: 0,
        resetAt: null,
      };
    }

    const oldest = recent[0]!.createdAt;
    const resetAt = new Date(oldest.getTime() + CONTACT_QUERY_WINDOW_MS);

    return {
      allowed: false,
      remaining: 0,
      limit: CONTACT_QUERY_RATE_LIMIT,
      retryAfterMinutes: minutesUntil(resetAt),
      resetAt: resetAt.toISOString(),
    };
  }

  async createQuery(
    body: CreateContactQueryBody,
    ip: string,
  ): Promise<
    | { ok: true; id: string; remaining: number; resetAt: string | null }
    | { ok: false; status: 429; retryAfterMinutes: number; resetAt: string }
  > {
    const limit = await this.getRateLimit(ip);
    if (!limit.allowed) {
      return {
        ok: false,
        status: 429,
        retryAfterMinutes: limit.retryAfterMinutes,
        resetAt: limit.resetAt!,
      };
    }

    const id = newId();
    await this.deps.db.insert(contactQueries).values({
      id,
      email: body.email,
      message: body.message,
      ip,
    });

    const after = await this.getRateLimit(ip);
    return {
      ok: true,
      id,
      remaining: after.remaining,
      resetAt: after.resetAt,
    };
  }
}
