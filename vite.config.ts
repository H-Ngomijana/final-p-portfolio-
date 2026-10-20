// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";

const loadServerEnvironment: Plugin = {
  name: "portfolio-server-environment",
  config(_, { command, mode }) {
    if (command === "serve") {
      const env = loadEnv(mode, process.cwd(), "");
      const serverVariableNames = [
        "ADMIN_USERNAME",
        "ADMIN_PASSWORD",
        "ADMIN_SESSION_SECRET",
        "DATABASE_URL",
        "POSTGRES_URL",
        "PORTFOLIO_DATA_DIR",
        "LOVABLE_CRON_SECRET",
        "LOVABLE_CRON_SECRET_PREVIOUS",
      ];

      for (const name of serverVariableNames) {
        if (!process.env[name] && env[name]) process.env[name] = env[name];
      }
    }
  },
};

export default defineConfig({
  plugins: [loadServerEnvironment],
  nitro: { preset: "netlify" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
