import { createFetch } from "@better-fetch/fetch";

import { env } from "#/env";

export const httpClient = createFetch({
  baseURL: env.VITE_BETTER_AUTH_URL,
  credentials: "include",
});

/** Same Better Fetch instance. */
export const $fetch = httpClient;

/** Orval mutator — returns the shape Orval's fetch client expects. */
export async function apiFetch<T>(url: string, init: RequestInit): Promise<T> {
  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const { data, error } = await httpClient(url, { ...init, headers });

  if (error) {
    throw error;
  }

  return {
    data,
    status: 200,
    headers: new Headers(),
  } as T;
}
