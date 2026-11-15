# DocuMind AI — Adaptive Agent Workflow

## Standard lifecycle
1. Inspect Git state and project architecture.
2. Clarify requirements and acceptance criteria.
3. Classify complexity, risk, dependencies and file overlap.
4. Choose single-agent, parallel-investigation, swarm, boost, teamwork or workflow execution.
5. Create task cards with owners, exclusive file scopes and verification criteria.
6. Define contracts before parallel implementation.
7. Implement in isolated workspaces where concurrent writes are needed.
8. Integrate only after inspecting diffs.
9. Run automated quality gates.
10. Obtain independent review and human approval for high-impact operations.

## Task card template
- ID:
- Objective:
- Owner:
- Workspace:
- Dependencies:
- Files exclusively owned:
- Acceptance criteria:
- Tests required:
- Risks:
- Deliverables:

## Agent completion template
- Task ID:
- Status:
- Files changed:
- Design decisions:
- Commands executed:
- Exit codes/results:
- Tests passed/failed/skipped:
- Known limitations:
- Follow-up required:

## Initial concurrency
Start with 2–3 implementation workers maximum. Use more only when the tasks are independent, the machine and model quotas permit it, and integration cost remains justified.

## Example DocuMind AI quality-engineering workstreams
- Build/CI: backend build tsconfig, backend scripts, CI workflow and dependency automation.
- Backend QA: backend Vitest configs, test setup, mocks, unit and integration tests.
- Frontend QA: frontend Vitest config, setup, MSW/EventSource fixtures and component/hook tests.

These workstreams come from the prior read-only quality blueprint. Before implementation, re-check the live repository and split shared files so no two agents own the same file.
