import { Resend } from "resend";

import { env } from "@/env";

let client: Resend | null = null;

export function getResendClient() {
  if (!env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

export type SendResendEmailInput = {
  kind: string;
  to: string | string[];
  subject: string;
  html: string;
};

export type SendResendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: "email_not_configured" | "send_failed"; message?: string };

export function logEmail(
  level: "info" | "warn" | "error",
  event: string,
  extra: Record<string, unknown>,
) {
  const line = JSON.stringify({ ts: new Date().toISOString(), event, ...extra });
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

export async function sendResendEmail(input: SendResendEmailInput): Promise<SendResendEmailResult> {
  const to = Array.isArray(input.to) ? input.to : [input.to];
  const resend = getResendClient();
  const from = env.RESEND_FROM_EMAIL;
  if (!resend || !from) {
    logEmail("warn", "email.unconfigured", { kind: input.kind, to });
    return { ok: false, error: "email_not_configured" };
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    ...(env.RESEND_REPLY_TO ? { replyTo: env.RESEND_REPLY_TO } : {}),
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    logEmail("error", "email.failed", { kind: input.kind, to, error: error.message });
    return { ok: false, error: "send_failed", message: error.message };
  }

  logEmail("info", "email.sent", { kind: input.kind, to, id: data?.id });
  return { ok: true, id: data?.id };
}
