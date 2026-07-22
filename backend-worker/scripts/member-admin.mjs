import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const database = "chongsheng-member-db";
const wranglerCli = resolve("node_modules/wrangler/bin/wrangler.js");
const rawArgs = process.argv.slice(2);
const command = rawArgs.shift();
const booleanFlags = new Set(["remote", "local", "yes", "all", "help"]);
const options = new Map();
const values = [];

for (let index = 0; index < rawArgs.length; index += 1) {
  const argument = rawArgs[index];
  if (argument === "-h") {
    options.set("help", true);
    continue;
  }
  if (!argument.startsWith("--")) {
    values.push(argument);
    continue;
  }
  const key = argument.slice(2);
  if (booleanFlags.has(key)) {
    options.set(key, true);
    continue;
  }
  const next = rawArgs[index + 1];
  if (next === undefined || next.startsWith("--")) throw new Error(`--${key} requires a value.`);
  options.set(key, next);
  index += 1;
}

if (options.has("remote") && options.has("local")) throw new Error("Choose either --remote or --local, not both.");
const remote = options.has("remote");

const commandHelp = {
  "card:list": "card:list [--status active|disabled|expired|revoked] [--limit 50] [--remote]",
  "card:disable": "card:disable <card-id-or-label> [--yes] [--remote]",
  "card:enable": "card:enable <card-id-or-label> [--remote]",
  "card:revoke": "card:revoke <card-id-or-label> --yes [--remote]",
  "card:devices:list": "card:devices:list <card-id-or-label> [--remote]",
  "card:devices:reset": "card:devices:reset <card-id-or-label> --yes [--remote]",
  "card:sessions:list": "card:sessions:list <card-id-or-label> [--limit 50] [--remote]",
  "card:sessions:revoke": "card:sessions:revoke <session-id> --yes [--remote]\n  or: card:sessions:revoke <card-id-or-label> --all --yes [--remote]",
  "card:risk:show": "card:risk:show [--card <card-id-or-label>] [--limit 30] [--remote]",
  "product:list": "product:list [--active true|false] [--limit 100] [--remote]",
  "product:add": "product:add <slug> <title> --description <text> [--subtitle <text>] [--category resource-pack] [--status available] [--plan member] [--version <value>] [--sort-order 0] [--featured true|false] [--remote]",
  "product:update": "product:update <id-or-slug> [--title <text>] [--description <text>] [--subtitle <text>] [--category <value>] [--status <value>] [--plan <value>] [--version <value>] [--sort-order <number>] [--featured true|false] [--active true|false] [--remote]",
  "product:disable": "product:disable <id-or-slug> --yes [--remote]"
};

function printHelp(selectedCommand) {
  if (selectedCommand && commandHelp[selectedCommand]) {
    console.log(`Usage: npm run member:admin -- ${commandHelp[selectedCommand]}`);
    return;
  }
  console.log("Member administration CLI\n");
  console.log("Production commands require --remote. Destructive production commands also require --yes.\n");
  for (const usage of Object.values(commandHelp)) console.log(`  npm run member:admin -- ${usage}`);
}

function option(name, fallback) {
  return options.has(name) ? options.get(name) : fallback;
}

function safeId(value, label = "id") {
  if (!value || !/^[A-Za-z0-9_-]{1,100}$/u.test(value)) throw new Error(`${label} is required and invalid.`);
  return value;
}

function safeSlug(value) {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value) || value.length > 100) {
    throw new Error("slug must use lowercase letters, numbers, and single hyphens only.");
  }
  return value;
}

function safeEnum(value, label, allowed) {
  if (!allowed.includes(value)) throw new Error(`${label} must be one of: ${allowed.join(", ")}.`);
  return value;
}

function safeLabel(value, label, maximum, { required = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${label} is required.`);
    return null;
  }
  const normalized = String(value).trim();
  if (!normalized || normalized.length > maximum) throw new Error(`${label} must be between 1 and ${maximum} characters.`);
  return normalized;
}

function safeInteger(value, label, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be an integer between ${minimum} and ${maximum}.`);
  }
  return parsed;
}

function safeBoolean(value, label) {
  if (value === true || value === "true" || value === "1") return 1;
  if (value === false || value === "false" || value === "0") return 0;
  throw new Error(`${label} must be true or false.`);
}

function quote(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function limit(defaultValue = 50) {
  return safeInteger(option("limit", defaultValue), "limit", 1, 200);
}

function requireConfirmation(action, always = false) {
  if ((remote || always) && !options.has("yes")) {
    throw new Error(`${action} requires --yes${remote ? " in production" : ""}. No changes were made.`);
  }
}

function runSql(sql) {
  const result = spawnSync(
    process.execPath,
    [wranglerCli, "d1", "execute", database, remote ? "--remote" : "--local", "--command", sql, "--json"],
    { encoding: "utf8", shell: false, windowsHide: true }
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || "D1 command failed.").trim());
  try {
    const payload = JSON.parse(result.stdout);
    if (!Array.isArray(payload) || payload.some((entry) => entry.success !== true)) throw new Error("D1 returned an unsuccessful result.");
    return payload;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Wrangler returned an unreadable response.");
    throw error;
  }
}

function resultRows(payload) {
  return payload.flatMap((entry) => Array.isArray(entry.results) ? entry.results : []);
}

function printRows(rows, emptyMessage = "No records found.") {
  if (!rows.length) return console.log(emptyMessage);
  console.table(rows);
}

function resolveCard(reference) {
  const safeReference = safeId(reference, "card id or label");
  const rows = resultRows(runSql(`SELECT id, COALESCE(label, '') AS label, status FROM member_cards WHERE id = ${quote(safeReference)} OR label = ${quote(safeReference)} LIMIT 2;`));
  if (!rows.length) throw new Error("Card not found. No changes were made.");
  if (rows.length > 1) throw new Error("Card label is ambiguous. Use the card ID instead.");
  return rows[0];
}

function cardSummary(cardId) {
  return resultRows(runSql(`
    SELECT c.id, COALESCE(c.label, '') AS label, c.status, c.plan,
      (SELECT COUNT(*) FROM card_devices d WHERE d.card_id = c.id) AS devices,
      c.max_devices,
      (SELECT COUNT(*) FROM member_sessions s WHERE s.card_id = c.id AND s.revoked_at IS NULL
        AND s.expires_at > unixepoch() AND s.idle_expires_at > unixepoch()) AS active_sessions,
      c.max_active_sessions, c.successful_logins,
      CASE WHEN c.last_used_at IS NULL THEN '' ELSE datetime(c.last_used_at, 'unixepoch') END AS last_used_utc
    FROM member_cards c WHERE c.id = ${quote(cardId)};
  `));
}

function selectCardList() {
  const status = option("status", null);
  if (status !== null) safeEnum(status, "status", ["active", "disabled", "expired", "revoked"]);
  let where = "";
  if (status === "active") where = "WHERE c.status = 'active' AND (c.expires_at IS NULL OR c.expires_at > unixepoch())";
  else if (status === "expired") where = "WHERE c.status = 'expired' OR (c.status = 'active' AND c.expires_at IS NOT NULL AND c.expires_at <= unixepoch())";
  else if (status) where = `WHERE c.status = ${quote(status)}`;
  const rows = resultRows(runSql(`
    SELECT c.id, COALESCE(c.label, '') AS label, c.plan,
      CASE WHEN c.status = 'active' AND c.expires_at IS NOT NULL AND c.expires_at <= unixepoch()
        THEN 'expired' ELSE c.status END AS status,
      (SELECT COUNT(*) FROM card_devices d WHERE d.card_id = c.id) AS devices, c.max_devices,
      (SELECT COUNT(*) FROM member_sessions s WHERE s.card_id = c.id AND s.revoked_at IS NULL
        AND s.expires_at > unixepoch() AND s.idle_expires_at > unixepoch()) AS active_sessions,
      c.max_active_sessions, c.successful_logins,
      CASE WHEN c.expires_at IS NULL THEN '' ELSE datetime(c.expires_at, 'unixepoch') END AS expires_utc,
      CASE WHEN c.last_used_at IS NULL THEN '' ELSE datetime(c.last_used_at, 'unixepoch') END AS last_used_utc
    FROM member_cards c ${where}
    ORDER BY COALESCE(c.last_used_at, c.created_at) DESC LIMIT ${limit(50)};
  `));
  printRows(rows, "No member cards matched the filter.");
}

function disableCard() {
  requireConfirmation("Disabling a card and revoking its active sessions");
  const card = resolveCard(values[0]);
  const cardId = card.id;
  if (card.status === "revoked") throw new Error("A revoked card cannot be disabled.");
  runSql(`UPDATE member_cards SET status = 'disabled', token_version = token_version + 1 WHERE id = ${quote(cardId)} AND status != 'revoked'; UPDATE member_sessions SET revoked_at = COALESCE(revoked_at, unixepoch()) WHERE card_id = ${quote(cardId)} AND revoked_at IS NULL;`);
  printRows(cardSummary(cardId));
}

function enableCard() {
  const cardId = resolveCard(values[0]).id;
  const rows = resultRows(runSql(`UPDATE member_cards SET status = 'active' WHERE id = ${quote(cardId)} AND status = 'disabled' RETURNING id;`));
  if (rows.length === 0) throw new Error("Only disabled cards can be enabled. No changes were made.");
  printRows(cardSummary(cardId));
}

function revokeCard() {
  requireConfirmation("Permanently revoking a card", true);
  const cardId = resolveCard(values[0]).id;
  runSql(`UPDATE member_cards SET status = 'revoked', token_version = token_version + 1 WHERE id = ${quote(cardId)}; UPDATE member_sessions SET revoked_at = COALESCE(revoked_at, unixepoch()) WHERE card_id = ${quote(cardId)} AND revoked_at IS NULL;`);
  printRows(cardSummary(cardId));
}

function listDevices() {
  const cardId = resolveCard(values[0]).id;
  const rows = resultRows(runSql(`
    SELECT substr(d.id, 1, 8) || '…' AS device_reference,
      COALESCE(d.first_country, '') AS first_country, COALESCE(d.last_country, '') AS last_country,
      datetime(d.created_at, 'unixepoch') AS bound_utc, datetime(d.last_seen_at, 'unixepoch') AS last_seen_utc,
      (SELECT COUNT(*) FROM member_sessions s WHERE s.card_id = d.card_id AND s.device_hash = d.device_hash
        AND s.revoked_at IS NULL AND s.expires_at > unixepoch() AND s.idle_expires_at > unixepoch()) AS active_sessions
    FROM card_devices d WHERE d.card_id = ${quote(cardId)} ORDER BY d.last_seen_at DESC;
  `));
  printRows(rows, "No devices are bound to this card.");
}

function resetDevices() {
  requireConfirmation("Removing all devices and sessions from a card", true);
  const cardId = resolveCard(values[0]).id;
  const before = cardSummary(cardId)[0];
  runSql(`DELETE FROM member_sessions WHERE card_id = ${quote(cardId)}; DELETE FROM card_devices WHERE card_id = ${quote(cardId)};`);
  console.log(`Removed ${before?.devices || 0} device binding(s) and all sessions for ${cardId}.`);
  printRows(cardSummary(cardId));
}

function listSessions() {
  const cardId = resolveCard(values[0]).id;
  const rows = resultRows(runSql(`
    SELECT id AS session_id, plan, COALESCE(country, '') AS country,
      datetime(created_at, 'unixepoch') AS created_utc, datetime(last_seen_at, 'unixepoch') AS last_seen_utc,
      datetime(expires_at, 'unixepoch') AS expires_utc, datetime(idle_expires_at, 'unixepoch') AS idle_expires_utc,
      CASE WHEN revoked_at IS NOT NULL THEN 'revoked' WHEN expires_at <= unixepoch() THEN 'expired'
        WHEN idle_expires_at <= unixepoch() THEN 'idle-expired' ELSE 'active' END AS state
    FROM member_sessions WHERE card_id = ${quote(cardId)} ORDER BY created_at DESC LIMIT ${limit(50)};
  `));
  printRows(rows, "No sessions exist for this card.");
}

function revokeSessions() {
  requireConfirmation("Revoking member sessions", true);
  if (options.has("all")) {
    const cardId = resolveCard(values[0]).id;
    const rows = resultRows(runSql(`UPDATE member_sessions SET revoked_at = COALESCE(revoked_at, unixepoch()) WHERE card_id = ${quote(cardId)} AND revoked_at IS NULL RETURNING id;`));
    console.log(`Revoked ${rows.length} active session(s) for ${cardId}.`);
    return;
  }
  const sessionId = safeId(values[0], "session id");
  const rows = resultRows(runSql(`UPDATE member_sessions SET revoked_at = COALESCE(revoked_at, unixepoch()) WHERE id = ${quote(sessionId)} AND revoked_at IS NULL RETURNING id;`));
  if (rows.length === 0) throw new Error("Active session not found. No changes were made.");
  console.log(`Session ${sessionId} was revoked.`);
}

function showRisk() {
  const cardFilter = option("card", null);
  const cardId = cardFilter === null ? null : resolveCard(cardFilter).id;
  const filter = cardId ? `AND card_id = ${quote(cardId)}` : "";
  console.log("Recent abnormal member-login events (no IP, device, token, or card hashes are shown):");
  const events = resultRows(runSql(`
    SELECT id AS event_id, COALESCE(card_id, '') AS card_id, event_type, risk_level,
      datetime(created_at, 'unixepoch') AS created_utc
    FROM security_events
    WHERE (event_type != 'member_login_succeeded' OR risk_level NOT IN ('low', 'info')) ${filter}
    ORDER BY created_at DESC LIMIT ${limit(30)};
  `));
  printRows(events, "No abnormal security events were found.");
  console.log("\nCurrent failure-window summary:");
  const attempts = resultRows(runSql(`
    SELECT key_type, COUNT(*) AS tracked_keys, SUM(failures) AS failures,
      SUM(CASE WHEN blocked_until > unixepoch() THEN 1 ELSE 0 END) AS currently_blocked,
      CASE WHEN MAX(blocked_until) IS NULL THEN '' ELSE datetime(MAX(blocked_until), 'unixepoch') END AS latest_block_utc
    FROM login_attempts GROUP BY key_type ORDER BY key_type;
  `));
  printRows(attempts, "No active failure windows are recorded.");
}

function listProducts() {
  const active = option("active", null);
  const activeFilter = active === null ? "" : `WHERE active = ${safeBoolean(active, "active")}`;
  const rows = resultRows(runSql(`
    SELECT id, slug, title, category, status, plan_required, active, featured, sort_order,
      COALESCE(version, '') AS version,
      CASE WHEN updated_at IS NULL THEN '' ELSE datetime(updated_at, 'unixepoch') END AS updated_utc
    FROM member_products ${activeFilter}
    ORDER BY active DESC, featured DESC, sort_order ASC, created_at DESC LIMIT ${limit(100)};
  `));
  printRows(rows, "No member products matched the filter.");
}

function addProduct() {
  const slug = safeSlug(values[0]);
  const title = safeLabel(values[1], "title", 120, { required: true });
  const description = safeLabel(option("description", null), "description", 2000, { required: true });
  const subtitle = safeLabel(option("subtitle", null), "subtitle", 180);
  const category = safeLabel(option("category", "resource-pack"), "category", 50, { required: true });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(category)) throw new Error("category must use lowercase letters, numbers, and hyphens.");
  const status = safeLabel(option("status", "available"), "status", 30, { required: true });
  const plan = safeLabel(option("plan", "member"), "plan", 50, { required: true });
  const version = safeLabel(option("version", null), "version", 50);
  const sortOrder = safeInteger(option("sort-order", 0), "sort-order", -100000, 100000);
  const featured = options.has("featured") ? safeBoolean(option("featured"), "featured") : 0;
  const id = `product-${randomUUID()}`;
  runSql(`INSERT INTO member_products (id, slug, title, subtitle, category, description, status, plan_required, version, updated_at, sort_order, featured, active, created_at) VALUES (${quote(id)}, ${quote(slug)}, ${quote(title)}, ${quote(subtitle)}, ${quote(category)}, ${quote(description)}, ${quote(status)}, ${quote(plan)}, ${quote(version)}, unixepoch(), ${sortOrder}, ${featured}, 1, unixepoch());`);
  printRows(resultRows(runSql(`SELECT id, slug, title, category, status, plan_required, active, featured, sort_order FROM member_products WHERE id = ${quote(id)};`)));
}

function updateProduct() {
  const selector = safeId(values[0], "product id or slug");
  if (options.has("active") && safeBoolean(option("active"), "active") === 0) {
    requireConfirmation("Removing a product from the member catalog");
  }
  const assignments = [];
  const textFields = [["title", "title", 120], ["subtitle", "subtitle", 180], ["category", "category", 50], ["description", "description", 2000], ["status", "status", 30], ["plan", "plan_required", 50], ["version", "version", 50]];
  for (const [flag, column, maximum] of textFields) {
    if (!options.has(flag)) continue;
    const allowEmpty = flag === "subtitle" || flag === "version";
    const value = allowEmpty && option(flag) === "" ? null : safeLabel(option(flag), flag, maximum, { required: !allowEmpty });
    if (flag === "category" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)) throw new Error("category must use lowercase letters, numbers, and hyphens.");
    assignments.push(`${column} = ${quote(value)}`);
  }
  if (options.has("sort-order")) assignments.push(`sort_order = ${safeInteger(option("sort-order"), "sort-order", -100000, 100000)}`);
  if (options.has("featured")) assignments.push(`featured = ${safeBoolean(option("featured"), "featured")}`);
  if (options.has("active")) assignments.push(`active = ${safeBoolean(option("active"), "active")}`);
  if (!assignments.length) throw new Error("Provide at least one field to update.");
  assignments.push("updated_at = unixepoch()");
  const rows = resultRows(runSql(`UPDATE member_products SET ${assignments.join(", ")} WHERE id = ${quote(selector)} OR slug = ${quote(selector)} RETURNING id;`));
  if (rows.length === 0) throw new Error("Product not found. No changes were made.");
  printRows(resultRows(runSql(`SELECT id, slug, title, category, status, plan_required, active, featured, sort_order, COALESCE(version, '') AS version FROM member_products WHERE id = ${quote(selector)} OR slug = ${quote(selector)};`)));
}

function disableProduct() {
  const selector = safeId(values[0], "product id or slug");
  requireConfirmation("Removing a product from the member catalog", true);
  const rows = resultRows(runSql(`UPDATE member_products SET active = 0, updated_at = unixepoch() WHERE (id = ${quote(selector)} OR slug = ${quote(selector)}) AND active != 0 RETURNING id;`));
  if (rows.length === 0) throw new Error("Active product not found. No changes were made.");
  console.log(`Product ${selector} is no longer visible in the member catalog.`);
}

const commands = {
  "card:list": selectCardList,
  "card:disable": disableCard,
  "card:enable": enableCard,
  "card:revoke": revokeCard,
  "card:devices:list": listDevices,
  "card:devices:reset": resetDevices,
  "card:sessions:list": listSessions,
  "card:sessions:revoke": revokeSessions,
  "card:risk:show": showRisk,
  "product:list": listProducts,
  "product:add": addProduct,
  "product:update": updateProduct,
  "product:disable": disableProduct
};

try {
  if (!command || options.has("help")) printHelp(command);
  else if (!(command in commands)) {
    printHelp();
    throw new Error(`Unknown command: ${command}`);
  } else commands[command]();
} catch (error) {
  console.error(`Admin command failed: ${error instanceof Error ? error.message : "Unknown error."}`);
  process.exitCode = 1;
}
