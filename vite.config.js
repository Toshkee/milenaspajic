import { defineConfig } from "vite";

// Social cards and canonical links need absolute URLs. SITE_URL wins (set it in Vercel once the
// custom domain is live); otherwise Vercel's production domain is used. Locally it stays relative.
const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "")
).replace(/\/$/, "");

export default defineConfig({
  // hashed JS/CSS go to /static (cached forever via vercel.json); /assets keeps the public files
  build: { assetsDir: "static" },
  plugins: [
    {
      name: "site-url",
      transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", siteUrl),
    },
  ],
});
