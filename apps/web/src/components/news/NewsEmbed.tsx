export function NewsEmbed({ href }: { href: string }) {
  const label = (() => {
    try {
      return new URL(href, "https://example.invalid").pathname;
    } catch {
      return href;
    }
  })();
  return <a href={href}>{label}</a>;
}
