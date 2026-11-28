---
description: Review the Zoniq UI working tree with the read-only reviewer agent
agent: reviewer
subagent: true
---

Review the current Zoniq UI changes (`git status --short`, `git diff`, `git diff --cached`) against `AGENTS.md`, `docs/SPEC.md`, `docs/LIVE_API_IMPLEMENTATION_PLAN.md` and `docs/TESTING.md` for convention conformance, correctness, test coverage and regressions. Report findings by severity with `file:line` references and suggested fixes. Do not edit files.
