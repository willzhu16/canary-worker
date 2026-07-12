# Runbook: roll back canary-worker

Purpose: return production to the last-known-good version, fast. Target: < 5 minutes.
Mitigate first — fixing forward is a choice, not a reflex.

## Preconditions

- A previous good version exists (Workers keeps prior versions server-side).
- You have the production Cloudflare token access (via the GitHub environment, not locally).

## Steps

```bash
# Fastest path — roll back to the immediately previous Worker version:
wrangler rollback

# If the rollback needs a specific earlier tag (e.g. a bad migration interplay) —
# dispatch ON the tag ref; production only admits v* tag refs:
gh workflow run release.yml --ref <previous-good-tag> -f tag=<previous-good-tag>
```

## Verification

```bash
curl -fsS https://<worker-url>/healthz    # expect 200 with the previous version
```

Confirm the version reverted and the error rate returns to baseline.

## Data

Migrations are expand → migrate → contract, so old code always runs against the new
schema — a code rollback is always safe. Contract migrations ship at least one release
after their expand.

## After

Every rollback gets a postmortem (timeline · impact · root cause · detection gap · one
systemic fix filed as a platform/template issue).

## Last tested

2026-07-12 — the tag-redeploy path only: `gh workflow run release.yml --ref v1.0.0
-f tag=v1.0.0` rebuilt and redeployed v1.0.0 end to end (this is the same mechanism
a rollback to an earlier tag uses). The `wrangler rollback` fastest path is untested:
only one version exists so far — test it after the first real v1.0.1+.
