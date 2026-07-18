import assert from "node:assert/strict";
import test from "node:test";
import {
  hmacSha256Hex,
  memberDeviceIdIsValid,
  normalizeMemberCardCode,
  sha256Hex
} from "../src/crypto";
import { signMemberToken, verifyMemberToken } from "../src/token";

test("member card normalization accepts only the canonical safe alphabet", () => {
  const compact = "csvip26aaaa-bbbb-cccc-dddd-eeee-ffff";
  assert.equal(normalizeMemberCardCode(compact), "CSVIP-26-AAAA-BBBB-CCCC-DDDD-EEEE-FFFF");
  assert.equal(normalizeMemberCardCode("CSVIP-26-0000-BBBB-CCCC-DDDD-EEEE-FFFF"), null);
  assert.equal(normalizeMemberCardCode("WRONG-26-AAAA-BBBB-CCCC-DDDD-EEEE-FFFF"), null);
});

test("device IDs have bounded, predictable syntax", () => {
  assert.equal(memberDeviceIdIsValid("device_1234567890"), true);
  assert.equal(memberDeviceIdIsValid("short"), false);
  assert.equal(memberDeviceIdIsValid("device id with spaces"), false);
});

test("member tokens are signed and tamper evident", async () => {
  const now = 1_784_304_000;
  const claims = {
    sub: "card-1",
    cardId: "card-1",
    sessionId: "session-1",
    deviceReference: "a".repeat(32),
    plan: "member",
    iat: now,
    exp: now + 3600,
    idleExp: now + 1800,
    tokenVersion: 1,
    jti: "test-jti"
  };
  const token = await signMemberToken(claims, "session-secret");
  assert.deepEqual(await verifyMemberToken(token, "session-secret", now), claims);
  assert.equal(await verifyMemberToken(`${token.slice(0, -1)}x`, "session-secret", now), null);
});

test("stored card and session references are hashes", async () => {
  assert.match(await hmacSha256Hex("card", "pepper"), /^[a-f0-9]{64}$/u);
  assert.match(await sha256Hex("token"), /^[a-f0-9]{64}$/u);
});
