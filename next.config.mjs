import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Prevent Turbopack from treating C:\projects as the workspace root
  // (which breaks CSS @import "tailwindcss" and HMR paths).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
