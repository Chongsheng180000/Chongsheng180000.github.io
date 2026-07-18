import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const database = "chongsheng-member-db";
const wranglerCli = resolve("node_modules/wrangler/bin/wrangler.js");
const args = process.argv.slice(2);
const command = args.shift();
const remote = args.includes("--remote");
const values = args.filter((value) => value !== "--remote");

function safeId(value, label = "id") {
  if (!value || !/^[A-Za-z0-9_-]{1,100}$/u.test(value)) throw new Error(`${label} is required and invalid.`);
  return value;
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function execute(sql) {
  const result = spawnSync(
    process.execPath,
    [wranglerCli, "d1", "execute", database, remote ? "--remote" : "--local", "--command", sql],
    { stdio: "inherit", shell: false }
  );
  process.exitCode = result.status ?? 1;
}

const commands = {
  "card:list": () => execute(
    "SELECT id, label, plan, status, max_devices, max_active_sessions, expires_at, successful_logins, created_at, last_used_at FROM member_cards ORDER BY created_at DESC;"
  ),
  "card:disable": () => {
    const id = quote(safeId(values[0], "card id"));
    execute(`UPDATE member_cards SET status = 'disabled', token_version = token_version + 1 WHERE id = ${id}; UPDATE member_sessions SET revoked_at = COALESCE(revoked_at, unixepoch()) WHERE card_id = ${id};`);
  },
  "card:enable": () => execute(`UPDATE member_cards SET status = 'active' WHERE id = ${quote(safeId(values[0], "card id"))} AND status = 'disabled';`),
  "card:revoke": () => {
    const id = quote(safeId(values[0], "card id"));
    execute(`UPDATE member_cards SET status = 'revoked', token_version = token_version + 1 WHERE id = ${id}; UPDATE member_sessions SET revoked_at = COALESCE(revoked_at, unixepoch()) WHERE card_id = ${id};`);
  },
  "card:devices:list": () => execute(`SELECT id, first_country, last_country, created_at, last_seen_at FROM card_devices WHERE card_id = ${quote(safeId(values[0], "card id"))} ORDER BY last_seen_at DESC;`),
  "card:devices:reset": () => {
    const id = quote(safeId(values[0], "card id"));
    execute(`DELETE FROM member_sessions WHERE card_id = ${id}; DELETE FROM card_devices WHERE card_id = ${id};`);
  },
  "card:sessions:list": () => execute(`SELECT id, plan, country, created_at, last_seen_at, expires_at, idle_expires_at, revoked_at FROM member_sessions WHERE card_id = ${quote(safeId(values[0], "card id"))} ORDER BY created_at DESC;`),
  "card:sessions:revoke": () => execute(`UPDATE member_sessions SET revoked_at = COALESCE(revoked_at, unixepoch()) WHERE id = ${quote(safeId(values[0], "session id"))};`),
  "card:risk:show": () => execute("SELECT key_type, COUNT(*) AS tracked_keys, SUM(failures) AS failures, MAX(blocked_until) AS latest_block FROM login_attempts GROUP BY key_type;"),
  "product:list": () => execute("SELECT id, slug, title, category, status, plan_required, active, sort_order, updated_at FROM member_products ORDER BY sort_order ASC;"),
  "product:add": () => {
    const slug = safeId(values[0], "slug");
    const title = values[1];
    if (!title || title.length > 120) throw new Error("title is required and must be at most 120 characters.");
    execute(`INSERT INTO member_products (id, slug, title, category, description, status, plan_required, sort_order, featured, active, created_at) VALUES (${quote(`product-${slug}`)}, ${quote(slug)}, ${quote(title)}, 'resource', 'Pending description.', 'preview', 'member', 0, 0, 1, unixepoch());`);
  },
  "product:update": () => {
    const id = quote(safeId(values[0], "product id"));
    const title = values[1];
    if (!title || title.length > 120) throw new Error("title is required and must be at most 120 characters.");
    execute(`UPDATE member_products SET title = ${quote(title)}, updated_at = unixepoch() WHERE id = ${id};`);
  },
  "product:disable": () => execute(`UPDATE member_products SET active = 0, updated_at = unixepoch() WHERE id = ${quote(safeId(values[0], "product id"))};`)
};

if (!command || !(command in commands)) {
  console.error(`Usage: npm run member:admin -- <command> [arguments] [--remote]\nCommands: ${Object.keys(commands).join(", ")}`);
  process.exit(1);
}

try {
  commands[command]();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Admin command failed.");
  process.exit(1);
}
