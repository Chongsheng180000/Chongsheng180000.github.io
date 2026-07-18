# chongsheng-backend

Cloudflare Worker backend for CHONGSHENG EXECUTIVE OS.

## Member runtime secrets

The member system reads these values only from Worker runtime secrets or the ignored local `.dev.vars` file:

- `MEMBER_CARD_PEPPER`
- `MEMBER_SESSION_SECRET`
- `DEVICE_HASH_PEPPER`
- `IP_HASH_PEPPER`

`TURNSTILE_SECRET` is optional for the member flow.

### Pepper safety warning

- The `MEMBER_CARD_PEPPER` used to generate card hashes must exactly match the Cloudflare Worker runtime secret.
- A mismatched Pepper makes every generated member card fail verification.
- Never regenerate and overwrite an existing Pepper after cards have been issued.
- If the Pepper is lost, existing card hashes cannot be verified again.
- Keep an offline encrypted backup. Never commit the value to Git, configuration, documentation, tests, frontend code, or logs.

The other member secrets require the same handling. Secret values must not be stored in `wrangler.jsonc`.
