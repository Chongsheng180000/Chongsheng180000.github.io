import { revokeMemberSession } from "../auth";
import type { Env } from "../env";
import { json } from "../response";

export async function handleMemberLogout(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  try {
    if (!await revokeMemberSession(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401, origin);
    }
    return json({ ok: true }, 200, origin);
  } catch {
    return json({ ok: false, error: "Unauthorized" }, 401, origin);
  }
}
