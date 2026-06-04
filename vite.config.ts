import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    server: {
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        "ai.agroecologymap.org",
        "dev.climabalance.org",
        "climabalance.org",
        "www.climabalance.org",
      ],
      port: 5173,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
