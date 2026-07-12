# Runbook: deploy canary-worker

Purpose: ship a tagged release to production. Deploys are versioned and immutable — what
runs in production is a tagged artifact, never a branch tip.

## Preconditions

- The change is merged to `main` and CI is green.
- The release-please "release" PR is merged (this is the human release decision).
- Current production schema is compatible with the previous release (migrations are
  expand → migrate → contract).

## Steps

```bash
# Releases are tag-driven: merging the release PR tags vX.Y.Z and release.yml deploys.
# To deploy manually from a tag (rare) — dispatch ON the tag ref; the production
# environment only allows v* tag refs, so a run from main would be rejected:
gh workflow run release.yml --ref vX.Y.Z -f tag=vX.Y.Z
```

## Verification

```bash
curl -fsS https://<worker-url>/healthz    # expect 200 {"version":"vX.Y.Z"}
```

Confirm the version matches the tag you deployed. Check error rate in the dashboard for
5 minutes before considering it done.

## Rollback of this runbook

If a deploy goes wrong, follow [rollback.md](rollback.md).

## Last tested

2026-07-12 — v1.0.0, both paths: the tag-driven release (merge release PR → tag →
build → artifact + hashes → deploy) and the manual redeploy command above. Verified
live: `/healthz` returned `{"version":"v1.0.0"}`. One-time snag worth knowing: the
first deploy in a Cloudflare account fails until a `workers.dev` subdomain is
registered (dashboard → Workers & Pages → "Your subdomain").
