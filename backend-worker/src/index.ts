const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
} as const;

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return json({
        ok: true,
        service: "chongsheng-backend"
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        ok: true,
        status: "healthy"
      });
    }

    return json(
      {
        ok: false,
        error: "Not Found"
      },
      404
    );
  }
} satisfies ExportedHandler;
