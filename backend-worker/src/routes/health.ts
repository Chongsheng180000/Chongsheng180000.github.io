import { json } from "../response";

export function handleRoot(): Response {
  return json({ ok: true, service: "chongsheng-backend" });
}

export function handleHealth(): Response {
  return json({ ok: true, status: "healthy" });
}
