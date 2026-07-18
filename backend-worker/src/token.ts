import { base64UrlToBytes, bytesToBase64Url, constantTimeEqual, hmacSha256Base64Url } from "./crypto";
import type { MemberTokenClaims } from "./types";

const TOKEN_HEADER = { alg: "HS256", typ: "CS-MEMBER" } as const;

function encodeJson(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T | null {
  const bytes = base64UrlToBytes(value);
  if (!bytes) return null;
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

function claimsAreValid(claims: MemberTokenClaims, now: number): boolean {
  return Boolean(
    claims
    && typeof claims.sub === "string"
    && typeof claims.cardId === "string"
    && typeof claims.sessionId === "string"
    && typeof claims.deviceReference === "string"
    && typeof claims.plan === "string"
    && Number.isInteger(claims.iat)
    && Number.isInteger(claims.exp)
    && Number.isInteger(claims.idleExp)
    && Number.isInteger(claims.tokenVersion)
    && typeof claims.jti === "string"
    && claims.sub === claims.cardId
    && claims.iat <= now + 60
    && claims.exp > now
    && claims.exp > claims.iat
  );
}

export async function signMemberToken(claims: MemberTokenClaims, secret: string): Promise<string> {
  const unsigned = `${encodeJson(TOKEN_HEADER)}.${encodeJson(claims)}`;
  const signature = await hmacSha256Base64Url(unsigned, secret);
  return `${unsigned}.${signature}`;
}

export async function verifyMemberToken(
  token: string,
  secret: string,
  now = Math.floor(Date.now() / 1000)
): Promise<MemberTokenClaims | null> {
  if (token.length > 4096) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedClaims, signature] = parts;
  const header = decodeJson<{ alg?: string; typ?: string }>(encodedHeader);
  const claims = decodeJson<MemberTokenClaims>(encodedClaims);
  if (!header || header.alg !== TOKEN_HEADER.alg || header.typ !== TOKEN_HEADER.typ || !claims) return null;

  const expected = await hmacSha256Base64Url(`${encodedHeader}.${encodedClaims}`, secret);
  if (!constantTimeEqual(signature, expected) || !claimsAreValid(claims, now)) return null;
  return claims;
}
