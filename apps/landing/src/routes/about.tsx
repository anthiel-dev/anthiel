import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Anthiel" },
      {
        name: "description",
        content: "Anthiel landing page",
      },
    ],
  }),
  component: About,
});

function About() {
  return <div>About</div>;
}
