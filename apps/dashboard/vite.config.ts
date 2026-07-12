import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type PluginOption } from "vite";

const config = defineConfig(async ({ command }) => {
  const plugins: PluginOption[] = [
    tailwindcss(),
    tanstackStart({
      // Prerender conflicts with Nitro bun builds during `vite build` on Node.
      // Routes still SSR on request in production.
      prerender: {
        enabled: false,
      },
    }),
    nitro({ preset: "bun" }),
    viteReact(),
  ];

  // Devtools inject markup that can mismatch SSR hydration; keep them out of production builds.
  if (command === "serve") {
    const { devtools } = await import("@tanstack/devtools-vite");
    plugins.unshift(devtools());
  }

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins,
  };
});

export default config;
