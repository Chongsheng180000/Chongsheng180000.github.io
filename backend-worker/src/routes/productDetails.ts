import { authenticateMember } from "../auth";
import { findActiveMemberProduct, planCanAccess, publicProduct } from "../database";
import type { Env } from "../env";
import { json } from "../response";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export async function handleMemberProductDetails(
  request: Request,
  env: Env,
  slug: string
): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  try {
    const member = await authenticateMember(request, env);
    if (!member) return json({ ok: false, error: "Unauthorized" }, 401, origin);
    if (!SLUG_PATTERN.test(slug) || slug.length > 100) {
      return json({ ok: false, error: "Not Found" }, 404, origin);
    }
    const product = await findActiveMemberProduct(env.DB, slug);
    if (!product || !planCanAccess(member.plan, product.plan_required)) {
      return json({ ok: false, error: "Not Found" }, 404, origin);
    }
    return json({ ok: true, product: publicProduct(product) }, 200, origin);
  } catch {
    return json({ ok: false, error: "Unauthorized" }, 401, origin);
  }
}
