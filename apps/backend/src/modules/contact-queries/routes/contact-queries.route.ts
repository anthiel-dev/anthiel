import { Elysia } from "elysia";

import type { AppDb } from "@/database";

import { CONTACT_QUERY_RATE_LIMIT } from "../constants";
import { createContactQueryBodySchema } from "../contracts/request.contract";
import {
  contactQueryErrorResponseSchema,
  createContactQueryResponseSchema,
  getContactQueryRateLimitResponseSchema,
} from "../contracts/response.contract";
import { ContactQueriesService } from "../services/contact-queries.service";

function getClientIp(
  request: Request,
  server: { requestIP?: (req: Request) => { address: string } | null } | null,
) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return server?.requestIP?.(request)?.address ?? "unknown";
}

export const contactQueriesRoutes = (db: AppDb) => {
  const contactQueriesService = new ContactQueriesService({ db });

  return new Elysia({
    prefix: "/contact-queries",
    name: "contact-queries",
    tags: ["Contact queries"],
  })
    .get(
      "/rate-limit",
      async ({ request, server }) => {
        const ip = getClientIp(request, server);
        return { data: await contactQueriesService.getRateLimit(ip) };
      },
      {
        response: getContactQueryRateLimitResponseSchema,
        detail: {
          summary: "Get contact query rate limit for caller IP",
          operationId: "getContactQueryRateLimit",
        },
      },
    )
    .post(
      "",
      async ({ body, request, server, status, set }) => {
        const ip = getClientIp(request, server);
        const result = await contactQueriesService.createQuery(body, ip);

        if (!result.ok) {
          set.headers["Retry-After"] = String(result.retryAfterMinutes * 60);
          return status(429, {
            error: "Rate limit exceeded. Try again later.",
            retryAfterMinutes: result.retryAfterMinutes,
            resetAt: result.resetAt,
          });
        }

        return status(201, {
          data: {
            id: result.id,
            remaining: result.remaining,
            limit: CONTACT_QUERY_RATE_LIMIT,
            resetAt: result.resetAt,
          },
        });
      },
      {
        body: createContactQueryBodySchema,
        response: {
          201: createContactQueryResponseSchema,
          429: contactQueryErrorResponseSchema,
        },
        detail: {
          summary: "Submit a custom contact query from the landing chat",
          operationId: "createContactQuery",
        },
      },
    );
};
