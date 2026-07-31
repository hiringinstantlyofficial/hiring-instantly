import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  /*
   * tsconfig sets `jsx: "preserve"` for Next to handle, which would leave JSX in
   * place and break under Node. The blog registry imports article bodies from
   * `.tsx` modules, so the test run needs a real transform of its own.
   */
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    /*
     * Modules under test read these at import time, so they have to be set
     * before the module graph is loaded rather than inside a test body.
     * They are fixtures, not real credentials.
     */
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://test-project.supabase.co",
      NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS: "cdn.example.com, logos.example.org",
    },
  },
});
