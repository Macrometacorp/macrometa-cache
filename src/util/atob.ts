export function atob(str: string) {
  return Buffer.from(str, 'base64').toString();
}
