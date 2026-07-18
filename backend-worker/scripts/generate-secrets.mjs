import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outputPath = resolve(".dev.vars");
const force = process.argv.includes("--force");
const memberKeys = [
  "MEMBER_CARD_PEPPER",
  "MEMBER_SESSION_SECRET",
  "DEVICE_HASH_PEPPER",
  "IP_HASH_PEPPER"
];

const existing = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : "";
const lines = existing.split(/\r?\n/u).filter(Boolean);
const values = new Map();
for (const line of lines) {
  const separator = line.indexOf("=");
  if (separator > 0) values.set(line.slice(0, separator).trim(), line.slice(separator + 1));
}

const alreadyConfigured = memberKeys.filter((key) => values.has(key) && values.get(key));
if (alreadyConfigured.length && !force) {
  console.error("Member secrets already exist. Use --force only when intentional rotation is planned.");
  process.exit(1);
}

for (const key of memberKeys) values.set(key, randomBytes(48).toString("base64url"));
const output = [...values.entries()].map(([key, value]) => `${key}=${value}`).join("\n") + "\n";
writeFileSync(outputPath, output, { encoding: "utf8", mode: 0o600 });
console.log(`Wrote ${memberKeys.length} member secrets to .dev.vars. Secret values were not printed.`);
