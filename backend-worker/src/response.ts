export const ALLOWED_ORIGIN = "https://chongsheng180000.github.io";

export const MEMBER_FAILURE = {
  ok: false,
  message: "\u5361\u5bc6\u65e0\u6548\u6216\u4e0d\u53ef\u7528\u3002\u5361\u5bc6\u8bf7\u8054\u7cfb\u7ad9\u4e3b\u9886\u53d6\u3002"
} as const;

export function json(payload: unknown, status = 200, origin?: string): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin"
  });

  if (origin === ALLOWED_ORIGIN) headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  return new Response(JSON.stringify(payload), { status, headers });
}

export function memberFailure(status = 401, origin?: string): Response {
  return json(MEMBER_FAILURE, status, origin);
}
