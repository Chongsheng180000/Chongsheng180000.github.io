import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

const script = resolve("scripts/member-admin.mjs");

function run(...args: string[]) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: resolve("."),
    encoding: "utf8",
    shell: false,
    windowsHide: true
  });
}

test("member admin exposes all required commands", () => {
  const result = run();
  assert.equal(result.status, 0);
  for (const command of [
    "card:list",
    "card:disable",
    "card:enable",
    "card:revoke",
    "card:devices:list",
    "card:devices:reset",
    "card:sessions:list",
    "card:sessions:revoke",
    "card:risk:show",
    "product:list",
    "product:add",
    "product:update",
    "product:disable"
  ]) assert.equal(result.stdout.includes(command), true, `missing ${command} from help output`);
});

test("destructive commands require explicit confirmation before D1 access", () => {
  const revoke = run("card:revoke", "test-card");
  assert.equal(revoke.status, 1);
  assert.match(revoke.stderr, /requires --yes/u);

  const remoteDisable = run("card:disable", "test-card", "--remote");
  assert.equal(remoteDisable.status, 1);
  assert.match(remoteDisable.stderr, /requires --yes in production/u);

  const hiddenProduct = run("product:update", "test-product", "--active", "false", "--remote");
  assert.equal(hiddenProduct.status, 1);
  assert.match(hiddenProduct.stderr, /requires --yes in production/u);
});

test("product input validation rejects unsafe slugs before D1 access", () => {
  const result = run("product:add", "Unsafe Slug", "Title", "--description", "Description");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /slug must use lowercase/u);
});
