import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/faq/")({
  beforeLoad: () => {
    throw redirect({ to: "/{-$locale}", hash: "faq" });
  },
});
