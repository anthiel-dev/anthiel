import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/built")({
  beforeLoad: () => {
    throw redirect({ to: "/{-$locale}", hash: "work" });
  },
});
