import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import worker from "../src/index";

const ORIGIN = "https://chongsheng180000.github.io";

class MockStatement {
  constructor(private readonly sql: string, private readonly values: unknown[] = []) {}
  bind(...values: unknown[]): MockStatement {
    return new MockStatement(this.sql, values);
  }
  async first<T>(): Promise<T | null> {
    return null;
  }
  async all<T>(): Promise<D1Result<T>> {
    return { results: [], success: true, meta: {} as D1Meta };
  }
  async run(): Promise<D1Result> {
    return { results: [], success: true, meta: { changes: 1 } as D1Meta };
  }
}

const mockDb = {
  prepare(sql: string) {
    return new MockStatement(sql) as unknown as D1PreparedStatement;
  },
  async batch(statements: D1PreparedStatement[]) {
    return Promise.all(statements.map((statement) => statement.run()));
  }
} as unknown as D1Database;

const context = {
  waitUntil() {},
  passThroughOnException() {},
  props: {}
} as unknown as ExecutionContext;

function env(overrides: Record<string, unknown> = {}) {
  return {
    DB: mockDb,
    MEMBER_CARD_PEPPER: "card-pepper",
    MEMBER_SESSION_SECRET: "session-secret",
    DEVICE_HASH_PEPPER: "device-pepper",
    IP_HASH_PEPPER: "ip-pepper",
    ...overrides
  } as never;
}

async function fetchWorker(request: Request, environment = env()): Promise<Response> {
  return worker.fetch(request, environment, context);
}

test("root and health remain available", async () => {
  const root = await fetchWorker(new Request("https://worker.test/"));
  assert.equal(root.status, 200);
  assert.deepEqual(await root.json(), { ok: true, service: "chongsheng-backend" });

  const health = await fetchWorker(new Request("https://worker.test/health"));
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true, status: "healthy" });
});

test("member CORS accepts only the blog origin and handles OPTIONS", async () => {
  const allowed = await fetchWorker(new Request("https://worker.test/api/member/products", {
    method: "OPTIONS",
    headers: { Origin: ORIGIN }
  }));
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.equal(allowed.headers.get("Access-Control-Allow-Headers"), "Content-Type, Authorization, X-Device-ID");

  const denied = await fetchWorker(new Request("https://worker.test/api/member/products", {
    method: "OPTIONS",
    headers: { Origin: "https://example.com" }
  }));
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get("Access-Control-Allow-Origin"), null);
});

test("invalid cards receive the unified public failure", async () => {
  const response = await fetchWorker(new Request("https://worker.test/api/member/verify-card", {
    method: "POST",
    headers: {
      Origin: ORIGIN,
      "Content-Type": "application/json",
      "CF-Connecting-IP": "192.0.2.1",
      "User-Agent": "member-test"
    },
    body: JSON.stringify({
      code: "CSVIP-26-AAAA-BBBB-CCCC-DDDD-EEEE-FFFF",
      deviceId: "device_1234567890"
    })
  }));
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    ok: false,
    message: "\u5361\u5bc6\u65e0\u6548\u6216\u4e0d\u53ef\u7528\u3002\u5361\u5bc6\u8bf7\u8054\u7cfb\u7ad9\u4e3b\u9886\u53d6\u3002"
  });
});

test("missing member secrets fail closed", async () => {
  const response = await fetchWorker(new Request("https://worker.test/api/member/verify-card", {
    method: "POST",
    headers: { Origin: ORIGIN, "Content-Type": "application/json" },
    body: JSON.stringify({ code: "anything", deviceId: "device_1234567890" })
  }), env({
    MEMBER_CARD_PEPPER: undefined,
    MEMBER_SESSION_SECRET: undefined,
    DEVICE_HASH_PEPPER: undefined,
    IP_HASH_PEPPER: undefined
  }));
  assert.equal(response.status, 503);
  assert.equal((await response.json() as { ok: boolean }).ok, false);
});

test("member products reject missing and invalid tokens", async () => {
  const missing = await fetchWorker(new Request("https://worker.test/api/member/products", {
    headers: { Origin: ORIGIN }
  }));
  assert.equal(missing.status, 401);

  const invalid = await fetchWorker(new Request("https://worker.test/api/member/products", {
    headers: {
      Origin: ORIGIN,
      Authorization: "Bearer invalid.token.value",
      "X-Device-ID": "device_1234567890"
    }
  }));
  assert.equal(invalid.status, 401);
});

test("member migration is valid SQLite and creates required tables", () => {
  const sql = readFileSync(resolve("migrations/0003_member_private_store.sql"), "utf8");
  const database = new DatabaseSync(":memory:");
  database.exec(sql);
  const tables = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
  ).all().map((row) => String(row.name));
  assert.deepEqual(
    ["card_devices", "login_attempts", "member_cards", "member_products", "member_sessions", "security_events"]
      .every((table) => tables.includes(table)),
    true
  );
  database.close();
});

test("private outputs are ignored and not tracked", () => {
  const root = resolve("..");
  const tracked = execFileSync("git", ["ls-files", "backend-worker/.dev.vars", "backend-worker/cards.private.txt", "backend-worker/cards.import.private.sql"], {
    cwd: root,
    encoding: "utf8"
  }).trim();
  assert.equal(tracked, "");

  const ignored = execFileSync("git", ["check-ignore", "backend-worker/.dev.vars", "backend-worker/cards.private.txt", "backend-worker/cards.import.private.sql"], {
    cwd: root,
    encoding: "utf8"
  }).trim().split(/\r?\n/u);
  assert.equal(ignored.length, 3);
});
