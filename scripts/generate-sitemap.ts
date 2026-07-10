import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL =
  process.env.SITEMAP_BASE_URL ?? "https://ai.agroecologymap.org";

const SUPPORTED_LANGS = ["en", "pt-BR", "es", "fr"];

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const staticRoutes: SitemapEntry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/how-it-works", changefreq: "monthly", priority: "0.8" },
  { loc: "/donate", changefreq: "monthly", priority: "0.7" },
  { loc: "/documents", changefreq: "daily", priority: "0.9" },
  { loc: "/community", changefreq: "daily", priority: "0.8" },
  { loc: "/login", changefreq: "monthly", priority: "0.3" },
  { loc: "/register", changefreq: "monthly", priority: "0.3" },
];

const today = new Date().toISOString().split("T")[0];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderUrl(entry: SitemapEntry): string {
  const lines = ["  <url>"];
  const url = `${BASE_URL}${entry.loc}`;
  lines.push(`    <loc>${escapeXml(url)}</loc>`);
  lines.push(`    <lastmod>${entry.lastmod ?? today}</lastmod>`);
  if (entry.changefreq) {
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  }
  if (entry.priority) {
    lines.push(`    <priority>${entry.priority}</priority>`);
  }

  SUPPORTED_LANGS.forEach((lang) => {
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(url)}" />`,
    );
  });

  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(url)}" />`,
  );

  lines.push("  </url>");
  return lines.join("\n");
}

const urls = staticRoutes.map(renderUrl).join("\n");

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  urls,
  "</urlset>",
  "",
].join("\n");

const outputPath = resolve(__dirname, "..", "public", "sitemap.xml");
writeFileSync(outputPath, sitemap, "utf-8");
console.log(`Sitemap generated: ${outputPath}`);
