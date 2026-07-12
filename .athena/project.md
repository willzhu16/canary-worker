# canary-worker — project instruction layer

Canary project exercising the Artemis pipeline

- This repo's PURPOSE is to exercise the platform: generation, CI gates, athena-sync,
  preview, release, deploy, and rollback. It serves no real traffic.
- Keep changes small but real — every PR should light up the full gate set, so a
  drive-by refactor here costs review time without testing anything new.
- Deploys go to canary-worker.<account>.workers.dev only; there is deliberately no
  custom domain and the CI deploy token has no zone permissions.
- Drill results are recorded in docs/runbooks/ ("Last tested" lines) — update them
  whenever a deploy or rollback drill runs.

<!--
This is the only per-repo instruction source (athena spec 04, ≤80 lines). It is merged
after the shared layers when compiling CLAUDE.md / AGENTS.md. Fill it with what an agent
cannot infer from the code: non-obvious constraints, domain rules, invariants, gotchas.
Keep it tight — link to docs rather than restating them. Do NOT edit CLAUDE.md/AGENTS.md
directly; they are compiled artifacts.
-->
