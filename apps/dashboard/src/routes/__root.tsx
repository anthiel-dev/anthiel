import { TooltipProvider } from "@anthiel/ui/components/tooltip";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Anthiel",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

const Devtools = import.meta.env.DEV
  ? lazy(() =>
      Promise.all([
        import("@tanstack/react-devtools"),
        import("@tanstack/react-router-devtools"),
      ]).then(([{ TanStackDevtools }, { TanStackRouterDevtoolsPanel }]) => ({
        default: function DevtoolsPanel() {
          return (
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          );
        },
      })),
    )
  : null;

function ClientDevtools() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!import.meta.env.DEV || !mounted || !Devtools) return null;

  return (
    <Suspense fallback={null}>
      <Devtools />
    </Suspense>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans">
        <div className="isolate relative flex min-h-svh flex-col">
          <TooltipProvider>{children}</TooltipProvider>
          <ClientDevtools />
          <Scripts />
        </div>
      </body>
    </html>
  );
}
