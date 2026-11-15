
# DocuMind AI - Agent Instructions

## Project Overview

DocuMind AI is an AI-powered study assistant that allows users to upload documents and interact with their content using AI.

The project includes:
- Frontend: React, TypeScript, and Vite.
- Backend: Node.js, Express, and TypeScript.
- Database: PostgreSQL and Prisma.
- AI integration: Gemini.
- Document processing and retrieval-augmented generation (RAG).

Always inspect the actual project configuration before assuming a technology, dependency, or implementation detail.

## Main Development Principles

- Prioritize quality over speed.
- Understand existing code before modifying it.
- Prefer simple, maintainable solutions.
- Avoid unnecessary complexity and dependencies.
- Preserve existing functionality.
- Follow `.agents/rules/development-standards.md`.

## Agent Responsibilities

### Architect
- Understand requirements.
- Inspect the existing architecture.
- Propose implementation plans and technical decisions.
- Coordinate specialist agents when necessary.
- Ensure consistency across the application.

### Backend Engineer
- Handle backend APIs, services, business logic, and integrations.
- Maintain backend architecture and data validation.
- Coordinate database-related changes with the relevant specialist when needed.

### Frontend Engineer
- Handle React components, pages, routing, state, and API integration.
- Maintain UI consistency, responsiveness, and accessibility.

### QA Engineer
- Create and execute relevant tests.
- Identify regressions and edge cases.
- Verify implementation quality.

### Code Reviewer
- Independently inspect implementation and code quality.
- Identify bugs, security issues, and architectural problems.
- Verify that changes satisfy the requirements.

## Adaptive Agent Workflow

Do not use every agent for every task.

- Small tasks: Use one appropriate agent.
- Frontend tasks: Use the Frontend Engineer.
- Backend tasks: Use the Backend Engineer.
- Cross-layer features: Coordinate relevant frontend and backend agents.
- Complex architectural tasks: Involve the Architect.
- Important changes: Request QA and independent code review.

Use parallel execution only when tasks are genuinely independent.

Avoid unnecessary delegation and overlapping file ownership.

## Planning and Approval

For significant features and architectural changes:

1. Understand the requirements.
2. Inspect the existing codebase.
3. Present the proposed architecture.
4. Show the implementation plan.
5. Identify affected files and database/API changes.
6. Explain risks and testing strategy.
7. Wait for explicit user approval before implementation.

Do not modify files, install dependencies, or run migrations before approval for significant changes.

Small, isolated fixes can proceed without a lengthy planning phase.

## Progress Reporting

During significant implementation work:
- Report the current phase.
- Identify active agents and their responsibilities.
- Report completed and pending tasks.
- Highlight blockers and important decisions.

After implementation:
- List created, modified, and deleted files.
- Explain what changed in each important file.
- Report tests and checks executed.
- Identify outstanding issues.

## Final Verification

Before declaring a task complete:
- Verify the implementation.
- Run relevant tests and type checks.
- Review the final changes.
- Request independent review when appropriate.
- Report any incomplete or unverified work.

Never claim success without verification.
