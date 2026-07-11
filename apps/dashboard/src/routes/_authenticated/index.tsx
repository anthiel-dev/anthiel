import { Badge, Button, Card, CardDescription, CardHeader, CardTitle } from "@anthiel/ui";
import { createFileRoute } from "@tanstack/react-router";

import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/")({
  head: () => pageMeta("Dashboard", "Anthiel dashboard"),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-3" data-reveal-item data-stagger="0">
        <Badge variant="secondary">Anthiel</Badge>
        <h1 className="font-heading text-4xl tracking-tight text-foreground">Dashboard</h1>
        <p className="max-w-xl text-muted-foreground text-base">
          Minimal scaffold sharing theme and components from <code>@anthiel/ui</code>.
        </p>
      </div>

      <Card data-reveal-item data-stagger="1">
        <CardHeader>
          <CardTitle>Ready to build</CardTitle>
          <CardDescription>
            Same Tailwind tokens, fonts, and dark theme as the landing app.
          </CardDescription>
        </CardHeader>
        <div className="flex gap-3 px-6 pb-6">
          <Button>Get started</Button>
          <Button variant="outline">Docs</Button>
        </div>
      </Card>
    </main>
  );
}
