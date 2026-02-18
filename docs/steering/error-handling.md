# Error Handling Standards

How errors are represented, propagated, and logged in the Redmine MCP server. Aligns with feature specs (e.g. `docs/specs/`) for Redmine status/body passthrough and retry rules.

## Philosophy

- **Passthrough**: Redmine’s HTTP status and body are not altered. Clients (and MCP callers) see the same status and body the server received, so agents can interpret 4xx/5xx and payloads correctly.
- **Fail fast**: Invalid config or tool input fails at the boundary (startup or tool validation). No silent fallbacks.
- **Structured logging**: One JSON object per event; no secrets or full bodies in logs.

## Result Type (Domain)

- **FetchIssueResult**: Discriminated union — success `{ ok: true, body }`, failure `{ ok: false, status, body }`. Used from Gateway through Use Case to Tool adapter. Body is unknown (Redmine JSON); status is number (HTTP status or 0 for fetch failure).
- **No exception for “expected” failures**: 4xx/5xx and network errors are normal outcomes; they are returned as `FetchIssueResult`, not thrown. Exceptions are for programming errors or unrecoverable env/config.

## Propagation

- **Gateway (HTTP adapter)**: Catches fetch exceptions; returns `{ ok: false, status: 0, body: { error: "fetch_failed", message } }`. Non-2xx responses return `{ ok: false, status: res.status, body }` without changing Redmine’s body.
- **Use case**: Returns Gateway result unchanged. No mapping or wrapping.
- **Tool adapter**: Success → MCP content with body (string or JSON string). Failure → MCP content with `{ statusCode, body }` and `isError: true`. No alteration of status or body; no partial or vague error messages.

## Retry

- **When**: Only on 5xx and 429 from Redmine. Not on 4xx or other statuses.
- **Strategy**: Exponential backoff (e.g. 1s, 2s, 4s); fixed max attempts (e.g. 3 retries after initial request). Use `Bun.sleep` (or equivalent) between attempts.
- **After exhausting retries**: Return the last 5xx/429 result (status + body) as `FetchIssueResult`. Do not throw; same shape as a single failure.
- **Idempotency**: GET is idempotent; safe to retry. No retry for non-GET or state-changing operations if added later.

## Logging

- **Events**: `fetch_issue_start`, `fetch_issue_success`, `fetch_issue_failure`, `fetch_issue_retry`; `get_issue_start`, `get_issue_success`, `get_issue_failure`. Include identifiers (e.g. `issueId`, `issue_id`, `status`, `attempt`) as needed. Do not log secrets or response bodies (see **`security.md`**).
- **Format**: `console.log(JSON.stringify({ event, ... }))` for machine-readable, grep-friendly logs.
- **Levels**: Single channel (e.g. stdout); no log levels in code today. If adding levels later, use ERROR for failures and WARN for retries; keep INFO for start/success.

## Client-Facing Error Shape (MCP Tool)

- **Success**: `content` with Redmine issue JSON (or stringified). No `isError`.
- **Failure**: `content` with `{ statusCode, body }` (Redmine status and body unchanged); `isError: true`. No generic “something went wrong” without status/body when the server returned them.

---
_Focus on patterns. Exact constants (e.g. retry count, delay) may live in design/specs._
