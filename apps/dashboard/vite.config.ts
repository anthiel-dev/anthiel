import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
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
  ],
});

export default config;
