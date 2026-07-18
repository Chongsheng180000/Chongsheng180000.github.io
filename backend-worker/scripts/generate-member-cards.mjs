import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const PRIVATE_CARDS_PATH = resolve("cards.private.txt");
const PRIVATE_SQL_PATH = resolve("cards.import.private.sql");

function parseArgs(argv) {
  const options = { count: 20, maxDevices: 2, plan: "member", expiresAt: null };
  for (const argument of argv) {
    const [key, value] = argument.split("=", 2);
    if (key === "--count") options.count = Number(value);
    else if (key === "--max-devices") options.maxDevices = Number(value);
    else if (key === "--plan") options.plan = value;
    else if (key === "--expires-at") {
      const numeric = Number(value);
      const parsed = Number.isFinite(numeric) ? numeric : Date.parse(value) / 1000;
      options.expiresAt = Number.isFinite(parsed) ? Math.floor(parsed) : Number.NaN;
    } else throw new Error(`Unknown option: ${key}`);
  }
  if (!Number.isInteger(options.count) || options.count < 1 || options.count > 1000) {
    throw new Error("--count must be an integer from 1 to 1000.");
  }
  if (!Number.isInteger(options.maxDevices) || options.maxDevices < 1 || options.maxDevices > 20) {
    throw new Error("--max-devices must be an integer from 1 to 20.");
  }
  if (!/^[a-z][a-z0-9_-]{0,31}$/u.test(options.plan)) throw new Error("--plan is invalid.");
  if (Number.isNaN(options.expiresAt)) throw new Error("--expires-at must be a Unix timestamp or date.");
  return options;
}

function readDevVars() {
  const path = resolve(".dev.vars");
  if (!existsSync(path)) throw new Error(".dev.vars is missing. Generate local secrets first.");
  const values = new Map();
  for (const line of readFileSync(path, "utf8").split(/\r?\n/u)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator > 0) values.set(line.slice(0, separator).trim(), line.slice(separator + 1));
  }
  return values;
}

function randomCharacter() {
  const acceptanceLimit = 256 - (256 % ALPHABET.length);
  while (true) {
    const value = randomBytes(1)[0];
    if (value < acceptanceLimit) return ALPHABET[value % ALPHABET.length];
  }
}

function createCardCode() {
  const body = Array.from({ length: 24 }, randomCharacter).join("");
  return `CSVIP-26-${body.match(/.{4}/gu).join("-")}`;
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const options = parseArgs(process.argv.slice(2));
const pepper = readDevVars().get("MEMBER_CARD_PEPPER");
if (!pepper || pepper === "replace_me") throw new Error("MEMBER_CARD_PEPPER is missing or still a placeholder.");
if (existsSync(PRIVATE_CARDS_PATH) || existsSync(PRIVATE_SQL_PATH)) {
  throw new Error("Private card output already exists. Move or remove it before generating another batch.");
}

const createdAt = Math.floor(Date.now() / 1000);
const cards = new Set();
while (cards.size < options.count) cards.add(createCardCode());

const cardLines = [];
const sqlLines = [];
let index = 0;
for (const code of cards) {
  index += 1;
  const codeHash = createHmac("sha256", pepper).update(code).digest("hex");
  const id = randomUUID();
  const label = `batch-${createdAt}-${String(index).padStart(4, "0")}`;
  cardLines.push(`${label}\t${code}`);
  sqlLines.push(
    `INSERT INTO member_cards (id, code_hash, label, plan, status, max_devices, max_active_sessions, session_absolute_ttl, session_idle_ttl, expires_at, token_version, successful_logins, created_at) VALUES (${sqlString(id)}, ${sqlString(codeHash)}, ${sqlString(label)}, ${sqlString(options.plan)}, 'active', ${options.maxDevices}, 2, 43200, 7200, ${options.expiresAt ?? "NULL"}, 1, 0, ${createdAt});`
  );
}
writeFileSync(PRIVATE_CARDS_PATH, cardLines.join("\n") + "\n", { encoding: "utf8", mode: 0o600 });
writeFileSync(PRIVATE_SQL_PATH, sqlLines.join("\n") + "\n", { encoding: "utf8", mode: 0o600 });
console.log(`Generated ${options.count} cards. Plaintext values were written only to cards.private.txt and were not printed.`);
