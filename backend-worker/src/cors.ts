import { ALLOWED_ORIGIN, json } from "./response";

const MEMBER_ALLOWED_METHODS = "GET, POST, OPTIONS";
const MEMBER_ALLOWED_HEADERS = "Content-Type, Authorization, X-Device-ID";

export function requestOrigin(request: Request): string {
  return request.headers.get("Origin") || "";
}

export function hasAllowedOrigin(request: Request): boolean {
  return requestOrigin(request) === ALLOWED_ORIGIN;
}

export function memberPreflight(request: Request): Response {
  const origin = requestOrigin(request);
  if (origin !== ALLOWED_ORIGIN) {
    return json({ ok: false, error: "Request rejected" }, 403);
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": MEMBER_ALLOWED_METHODS,
    "Access-Control-Allow-Headers": MEMBER_ALLOWED_HEADERS,
    "Access-Control-Max-Age": "600"
  });

  return new Response(null, { status: 204, headers });
}
