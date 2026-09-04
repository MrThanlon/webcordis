import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nitro({
      debug: true,
      logLevel: 4,
      serverDir: "./server",
    }),
  ],
});
