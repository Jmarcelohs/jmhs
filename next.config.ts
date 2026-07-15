import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O Chromium completo do pacote "puppeteer" (uso local, ~300MB) não pode
  // entrar no bundle da function serverless da Vercel — lá usamos
  // @sparticuz/chromium (ver src/app/api/diarias/[id]/pdf/route.ts).
  outputFileTracingExcludes: {
    "/api/diarias/[id]/pdf": ["node_modules/puppeteer/**"],
  },
};

export default nextConfig;
