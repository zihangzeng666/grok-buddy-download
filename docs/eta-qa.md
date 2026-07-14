# ETA + Status QA matrix

Fun-first status copy; ETA **pauses** while waiting on you (plan / permission / question).

## Automated

```bash
./scripts/test-multi-cli.sh
# or
.build/debug/GrokPet --self-test
```

Covers: wait-tool classification, permission events → `waitingForUser`, ETA pause freeze, presentation titles.

## Manual (real Grok)

| # | Scenario | Expect title vibe | ETA |
|---|----------|-------------------|-----|
| 1 | Multi-tool coding turn | Busy / thinking / typing | warming → countdown → done |
| 2 | Tool permission (e.g. shell) | **Need a green light** | **your move** (frozen bar) |
| 3 | Plan mode `exit_plan_mode` | **Plan check!** | paused |
| 4 | `ask_user_question` | **Quick Q!** | paused |
| 5 | Approve after wait | Resumes working / countdown | not stuck on wait |
| 6 | Idle after done | Boom. Done. / Chillin’ | 100% / done |
| 7 | Debug: Status fold + event log | wait=true mode=paused | — |

## Dev tips

- Panel → **event log** + Status fold shows `wait=` / `mode=` / `phase=` when inspector on.
- Do **not** expect countdown while the terminal is waiting for you.
