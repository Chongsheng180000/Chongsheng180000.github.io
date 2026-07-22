# Member Administration

Run commands from `backend-worker`. Commands use the local D1 database by default. Add `--remote` only when you intend to manage production.

```powershell
cd C:\Users\Administrator\Desktop\blog-second\backend-worker
npm run member:admin -- card:list --remote
```

The CLI never displays plaintext card codes, token hashes, device hashes, or IP hashes. The first column in `cards.private.txt` is the card label. Match it to the `label` column from `card:list`; card commands accept either that label or the internal `id`.

## Cards

```powershell
npm run member:admin -- card:list --remote
npm run member:admin -- card:list --status active --remote
npm run member:admin -- card:disable <card-id-or-label> --yes --remote
npm run member:admin -- card:enable <card-id-or-label> --remote
npm run member:admin -- card:revoke <card-id-or-label> --yes --remote
```

`card:disable` is reversible but immediately revokes active sessions. `card:revoke` is intended to be permanent.

## Devices and sessions

```powershell
npm run member:admin -- card:devices:list <card-id-or-label> --remote
npm run member:admin -- card:devices:reset <card-id-or-label> --yes --remote
npm run member:admin -- card:sessions:list <card-id-or-label> --remote
npm run member:admin -- card:sessions:revoke <session-id> --yes --remote
npm run member:admin -- card:sessions:revoke <card-id-or-label> --all --yes --remote
```

Resetting devices deletes all device bindings and sessions for that card. The member can bind devices again on the next successful login.

## Risk review

```powershell
npm run member:admin -- card:risk:show --remote
npm run member:admin -- card:risk:show --card <card-id-or-label> --limit 50 --remote
```

The report shows recent abnormal events and aggregate failure windows without revealing raw IP addresses or hashes.

## Member products

```powershell
npm run member:admin -- product:list --remote

npm run member:admin -- product:add private-guide "Private Guide" `
  --description "A member-only guide with a separately confirmed delivery scope." `
  --subtitle "Member reference" `
  --category tutorial `
  --status available `
  --version 1.0 `
  --sort-order 50 `
  --featured true `
  --remote

npm run member:admin -- product:update private-guide `
  --title "Private Guide 1.1" `
  --description "Updated member-only guide." `
  --version 1.1 `
  --featured true `
  --remote

npm run member:admin -- product:disable private-guide --yes --remote
```

Use `product:update <id-or-slug> --active true --remote` to restore a disabled listing. Private files and permanent download URLs remain outside this CLI.

## Safety rules

- Production changes always require `--remote`.
- Destructive production operations require `--yes`.
- Do not paste plaintext card codes into command arguments.
- Back up `MEMBER_CARD_PEPPER` and `cards.private.txt` offline.
- Run `npm run member:admin -- <command> --help` for command-specific syntax.
