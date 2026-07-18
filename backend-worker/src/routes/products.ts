import { authenticateMember } from "../auth";
import { listActiveMemberProducts, planCanAccess, publicProduct } from "../database";
import type { Env } from "../env";
import { json } from "../response";

export async function handleMemberProducts(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  try {
    const member = await authenticateMember(request, env);
    if (!member) return json({ ok: false, error: "Unauthorized" }, 401, origin);
    const products = (await listActiveMemberProducts(env.DB))
      .filter((product) => planCanAccess(member.plan, product.plan_required))
      .map(publicProduct);
    return json({ ok: true, products }, 200, origin);
  } catch {
    return json({ ok: false, error: "Unauthorized" }, 401, origin);
  }
}
