export function parseAnchorText(url: string): { host: string; path: string } {
  const u = new URL(url);
  return { host: u.host, path: u.pathname + u.search };
}
