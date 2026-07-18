import { authenticateMember } from "../auth";
import type { Env } from "../env";
import { json } from "../response";

export async function handleMemberSession(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  try {
    const member = await authenticateMember(request, env);
    if (!member) return json({ ok: false, error: "Unauthorized" }, 401, origin);
    return json({
      ok: true,
      member: {
        plan: member.plan,
        expiresAt: member.expiresAt,
        idleExpiresAt: member.idleExpiresAt
      }
    }, 200, origin);
  } catch {
    return json({ ok: false, error: "Unauthorized" }, 401, origin);
  }
}
