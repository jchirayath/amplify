import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base "./" + HashRouter: the build runs from any static host or folder, no rewrites needed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
});
