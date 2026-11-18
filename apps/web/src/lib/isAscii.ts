export function isAscii(s: string): boolean {
  return /^[\x00-\x7F]+$/.test(s);
}
