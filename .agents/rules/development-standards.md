
# Development Standards

## 1. General Principles
- Prioritize code quality, maintainability, readability, and security over speed.
- Follow the existing project architecture and coding conventions.
- Avoid unnecessary dependencies, abstractions, and overengineering.
- Reuse existing components, utilities, and services wherever possible.
- Do not introduce breaking changes without explaining their impact.

## 2. Before Implementation
- Understand the existing code before making changes.
- Identify the affected modules, files, and dependencies.
- For significant features, present the proposed architecture and implementation plan.
- Explain database changes, API changes, and security considerations.
- Wait for explicit user approval before implementing significant changes.
- For small, isolated fixes, avoid unnecessary planning.

## 3. Backend Standards
- Follow the existing Node.js, Express, and TypeScript architecture.
- Keep routes, controllers, services, and database operations separated.
- Validate incoming request data.
- Use centralized error handling.
- Never expose sensitive information in API responses.
- Keep business logic out of route handlers.
- Use Prisma consistently for database operations.

## 4. Frontend Standards
- Follow the existing React and TypeScript architecture.
- Build reusable components where appropriate.
- Keep components focused and maintainable.
- Separate API communication from UI components.
- Handle loading, error, and empty states.
- Avoid unnecessary state and duplicated logic.
- Maintain responsive and accessible interfaces.

## 5. Database Standards
- Follow the existing Prisma schema and database conventions.
- Use appropriate relationships, constraints, and indexes.
- Avoid destructive migrations without explicit approval.
- Never modify production data without authorization.
- Consider database integrity and migration rollback risks.

## 6. Security Standards
- Never hardcode secrets, API keys, or credentials.
- Validate and sanitize untrusted input.
- Enforce authentication and authorization on protected resources.
- Apply least-privilege access.
- Protect sensitive user and document data.
- Avoid logging passwords, tokens, or confidential information.

## 7. Testing Standards
- Write tests for important business logic and functionality.
- Test success cases, failure cases, and edge cases.
- Do not rely on unmocked external API calls in unit tests.
- Run relevant tests and type checks after implementation.
- Never claim tests passed unless they were actually executed.
- Fix regressions introduced by your changes.

## 8. Code Quality
- Use meaningful names for variables, functions, and components.
- Prefer simple and readable implementations.
- Avoid unnecessary duplication.
- Remove unused imports, variables, and dead code.
- Keep TypeScript types accurate; avoid unnecessary `any`.
- Follow existing formatting and linting conventions.

## 9. Git Safety
- Do not overwrite unrelated user changes.
- Do not use destructive Git commands without approval.
- Do not commit or push changes unless requested.
- Keep changes limited to the assigned task.
- Review the final diff before reporting completion.

## 10. Completion Requirements
After implementation, report:
- Summary of changes.
- Files created, modified, and deleted.
- Important implementation decisions.
- Tests and checks executed with results.
- Remaining issues or limitations.

Do not report unverified work as completed.
