import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const workspaceRoot = resolve(import.meta.dirname);
const appRoot = resolve(workspaceRoot, "apps/site");

export default defineConfig({
  root: appRoot,
  cacheDir: resolve(workspaceRoot, "node_modules/.vite-site"),
  plugins: [react()],
  resolve: {
    alias: {
      "@alceu/shared": resolve(workspaceRoot, "packages/shared/src/index.ts")
    },
    dedupe: ["react", "react-dom"]
  },
  optimizeDeps: {
    entries: [resolve(appRoot, "index.html")],
    exclude: ["@alceu/shared"],
    include: ["@supabase/supabase-js", "lucide-react", "react", "react-dom", "react/jsx-runtime"],
    esbuildOptions: {
      absWorkingDir: workspaceRoot
    }
  },
  build: {
    outDir: resolve(appRoot, "dist"),
    emptyOutDir: true
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    fs: {
      allow: [workspaceRoot]
    }
  }
});
