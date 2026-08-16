import { sql } from "drizzle-orm";

import { db } from "../database";
import { user } from "../database/schema";
import { logEmail, sendResendEmail } from "../lib/resend";
import { ROLE } from "../modules/rbac/catalog";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildMagicLinkEmailHtml(options: { name: string; url: string }) {
  const greetingName = options.name.trim() || "there";
  return `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.5; color: #111;">
      <p>Hello ${escapeHtml(greetingName)},</p>
      <p>Use this link to sign in to your Anthiel account. It expires in 10 minutes.</p>
      <p>
        <a href="${escapeHtml(options.url)}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
          Sign in to Anthiel
        </a>
      </p>
      <p style="color:#666;font-size:12px;">
        If the button does not work, open this link:<br />
        ${escapeHtml(options.url)}
      </p>
      <p style="color:#666;font-size:12px;">If you did not request this, you can ignore this email.</p>
    </div>
  `.trim();
}

/** Send a magic link only for existing, unbanned client users. Silent no-op otherwise. */
export async function sendClientMagicLink(input: { email: string; url: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.query.user.findFirst({
    where: sql`lower(${user.email}) = ${email}`,
    columns: { name: true, role: true, banned: true },
  });

  if (!existing) {
    logEmail("info", "email.skip", { kind: "magic-link", to: email, reason: "no_user" });
    return;
  }
  if (existing.banned) {
    logEmail("info", "email.skip", { kind: "magic-link", to: email, reason: "banned" });
    return;
  }
  if (existing.role !== ROLE.client) {
    logEmail("info", "email.skip", {
      kind: "magic-link",
      to: email,
      reason: "not_client",
      role: existing.role,
    });
    return;
  }

  const result = await sendResendEmail({
    kind: "magic-link",
    to: email,
    subject: "Sign in to Anthiel",
    html: buildMagicLinkEmailHtml({ name: existing.name, url: input.url }),
  });

  if (!result.ok) {
    throw new Error(result.message ?? result.error);
  }
}
