# Security Standards

Security posture for the Redmine MCP server: no HTTP API (stdio MCP); focus on configuration, input validation, and safe handling of secrets and logs.

## Philosophy

- Validate at boundaries; fail fast on invalid config or input. No config files for secrets; env-only.
- Least privilege: require only what’s needed (Redmine URL + API key). Don’t log secrets or response bodies.
- Prefer allow-lists and strict types (Zod) over block-lists.

## Configuration and Secrets

- **Secrets in env only**: `REDMINE_URL` and `REDMINE_API_KEY` are required at runtime. No secrets in repo, config files, or CLI args.
- **Startup validation**: Validate env with Zod before starting the server. On failure: log a clear message (no secrets), then `process.exit(1)`. No fallback defaults for missing/invalid API key or URL.
- **API key usage**: Send only in the `X-Redmine-API-Key` header to Redmine. Never log it, include it in error messages, or put it in MCP tool responses.

## Input Validation

- **Tool input**: Validate at the MCP tool boundary with Zod. Example: `issue_id` must be a positive integer; invalid input yields MCP validation error, not an uncaught exception.
- **Config**: `REDMINE_URL` must be a valid URL; `REDMINE_API_KEY` non-empty string. Use Zod’s `.url()` and `.min(1)` (or equivalent) with clear error messages.
- **Downstream**: Application and domain layers receive already-validated types (e.g. number); no re-validation of “raw” strings at use-case level.

## Logging (Security-Aware)

- **Do log**: Structured JSON events with a fixed set of safe fields (event names and identifiers). Enough to debug flow and errors without sensitive data. Format and event list: **`error-handling.md`** (Logging).
- **Do not log**: API key, Redmine response body, tokens, or any PII. Failure logs may include `status` (e.g. 404, 500) and retry count, but not body content.

## Transport and Runtime

- **MCP**: Stdio transport; no TLS in-app. Security of the pipe is the responsibility of the host (e.g. Cursor, Claude Desktop).
- **Redmine**: Outbound HTTPS only (URL must be valid; no enforcement of TLS version in app). Rely on Bun/runtime and Redmine server for TLS.
- **Dependencies**: Prefer well-maintained deps; update regularly. No custom crypto or auth beyond Redmine API key in header.

## Sensitive Data in Responses

- MCP tool success: Return Redmine issue JSON to the client. Assume the client is trusted (same user / same machine). No redaction of issue fields in this project.
- MCP tool error: Return `statusCode` and `body` from Redmine when available so the agent can act on them. Do not include API key or internal stack traces in content.

---
_Focus on patterns. No secrets or credentials in steering or code._
