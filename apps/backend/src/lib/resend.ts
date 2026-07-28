import { Resend } from "resend";

import { env } from "@/env";

let client: Resend | null = null;

export function getResendClient() {
  if (!env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}
