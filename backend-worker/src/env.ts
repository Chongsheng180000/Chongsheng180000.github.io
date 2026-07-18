export interface Env {
  DB: D1Database;
  CONTACT_DB?: D1Database;

  CONTACT_HASH_SECRET?: string;
  TURNSTILE_SECRET?: string;
  MAILER_URL?: string;
  MAILER_SHARED_SECRET?: string;

  MEMBER_CARD_PEPPER?: string;
  MEMBER_SESSION_SECRET?: string;
  DEVICE_HASH_PEPPER?: string;
  IP_HASH_PEPPER?: string;
}

export interface MemberSecrets {
  cardPepper: string;
  sessionSecret: string;
  devicePepper: string;
  ipPepper: string;
}

export function getMemberSecrets(env: Env): MemberSecrets | null {
  if (
    !env.MEMBER_CARD_PEPPER
    || !env.MEMBER_SESSION_SECRET
    || !env.DEVICE_HASH_PEPPER
    || !env.IP_HASH_PEPPER
  ) {
    return null;
  }

  return {
    cardPepper: env.MEMBER_CARD_PEPPER,
    sessionSecret: env.MEMBER_SESSION_SECRET,
    devicePepper: env.DEVICE_HASH_PEPPER,
    ipPepper: env.IP_HASH_PEPPER
  };
}
