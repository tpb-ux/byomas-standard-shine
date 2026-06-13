// Shared helpers for sitemap / news-sitemap / RSS generators.
// Runs at build time (predev / prebuild) — no app deps.

import { createClient } from "@supabase/supabase-js";

export const BASE_URL = "https://amazonia.estrato.com.br";
export const SITE_NAME = "Amazonia Research";
export const SITE_LANG = "pt-BR";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "https://scjknnhoiuaregewuxws.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjamtubmhvaXVhcmVnZXd1eHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzQ3ODUsImV4cCI6MjA4MDM1MDc4NX0.hnYDikVv88BOZGj7CyTQOfjdGvsvgUMkO2l3IV2J2pQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export function xmlEscape(input: unknown): string {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function cdata(input: unknown): string {
  if (input == null) return "";
  const safe = String(input).replace(/\]\]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safe}]]>`;
}

export function rfc822(date: string | Date): string {
  return new Date(date).toUTCString();
}

export function iso(date: string | Date): string {
  return new Date(date).toISOString();
}