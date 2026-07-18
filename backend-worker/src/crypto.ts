const CARD_PREFIX_COMPACT = "CSVIP26";
const CARD_BODY_LENGTH = 24;
const CARD_BODY_PATTERN = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{24}$/u;

export function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

export function base64UrlToBytes(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) return null;
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function hmacSha256Hex(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export async function hmacSha256Base64Url(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

export async function sha256Hex(value: string): Promise<string> {
  return bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

export function randomBase64Url(byteLength = 32): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export function constantTimeEqual(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;
  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

export function normalizeMemberCardCode(rawCode: string): string | null {
  const compact = rawCode.trim().toUpperCase().replace(/[\s-]+/gu, "");
  if (compact.length !== CARD_PREFIX_COMPACT.length + CARD_BODY_LENGTH) return null;
  if (!compact.startsWith(CARD_PREFIX_COMPACT)) return null;

  const body = compact.slice(CARD_PREFIX_COMPACT.length);
  if (!CARD_BODY_PATTERN.test(body)) return null;

  const groups = body.match(/.{4}/gu);
  if (!groups || groups.length !== 6) return null;
  return `CSVIP-26-${groups.join("-")}`;
}

export function memberDeviceIdIsValid(value: string): boolean {
  return value.length >= 16 && value.length <= 200 && /^[A-Za-z0-9._:-]+$/u.test(value);
}

export async function randomizedFailureDelay(): Promise<void> {
  const random = crypto.getRandomValues(new Uint16Array(1))[0] / 65_535;
  const milliseconds = Math.floor(800 + random * 601);
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
