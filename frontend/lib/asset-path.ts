// Resolves asset URLs across two roots:
//  - /media/...  -> served by the backend (NEXT_PUBLIC_API_BASE_URL)
//  - everything else relative -> frontend public/, must respect basePath when
//    the app is hosted under a subpath (e.g. GitHub Pages project site).

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const basePath = BASE_PATH;

export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/media/")) return `${API_BASE}${url}`;
  if (url.startsWith("/")) return `${BASE_PATH}${url}`;
  return url;
}
