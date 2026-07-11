import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "#features/auth";
import { pageMeta } from "#lib/page-meta";

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_guest/dashboard/auth/login")({
  validateSearch: loginSearchSchema,
  head: () => pageMeta("Sign in", "Sign in to Anthiel dashboard"),
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
