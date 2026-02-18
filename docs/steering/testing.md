# Testing Standards

Testing patterns for unit tests and E2E in the Redmine MCP server. Core tooling is documented in `tech.md`; this file adds structure, mocking, and coverage decisions.

## Philosophy

- Test behavior, not implementation. Assert outcomes and contracts (e.g. Gateway returns result; use case passes it through).
- Prefer fast, reliable tests; mock only externals (fetch, Bun APIs, process.env) and restore in `afterEach`.
- Cover critical paths (use case, adapter success/failure, config validation); breadth over 100% pursuit. E2E via MCP Inspector for full flows.

## Organization

- **Co-located**: Test files sit next to the module under test as `*.test.ts` (e.g. `fetch-issue-use-case.test.ts` next to `fetch-issue-use-case.ts`). Same directory, same layer.
- **Naming**: Files `*.test.ts`; suites `describe("ModuleOrClass")`; cases describe expected behavior in natural language (e.g. "execute は gateway.fetchIssue の結果をそのまま返す（成功）").
- **Runner**: `bun test`; no separate test directory.

## Test Types

- **Unit**: Single unit (use case, adapter, pure config parser). Mock dependencies (ports) or globals (fetch, Bun.sleep). Very fast.
- **E2E**: Full MCP server with real Redmine or stub; use MCP Inspector and `bun run inspector`. Not automated in `bun test`; manual or CI script.

No integration test layer in repo today; add only if a clear need (e.g. multi-adapter flows without full E2E).

## Structure (AAA)

```typescript
it("does X when Y", async () => {
  // Arrange
  const gateway = { fetchIssue: mock(() => Promise.resolve({ ok: true, body })) } as IRedmineGateway;
  const useCase = new FetchIssueUseCase(gateway);
  // Act
  const result = await useCase.execute(42);
  // Assert
  expect(gateway.fetchIssue).toHaveBeenCalledWith(42);
  expect(result).toEqual({ ok: true, body });
});
```

Use `describe` / `it` / `expect` / `mock` from `bun:test`. Prefer one logical assertion per case where it keeps intent clear.

## Mocking

- **Ports (application layer)**: Implement the port interface with `mock()` from `bun:test`. Return controlled success/failure (e.g. `FetchIssueResult`). Assert call count and arguments.
- **Globals (adapters)**: For HTTP/time, replace `globalThis.fetch` and `Bun.sleep` in `beforeEach`; save originals and restore in `afterEach`. Mock implementations return `Response` or `Promise.resolve()` so tests don’t wait or hit the network.
- **Config**: Test the pure parser (e.g. `parseConfigEnv(env)`) with an env object; do not call `loadConfigEnv()` in tests (it uses `process.env` and `process.exit`). Export a parse function for tests if needed.
- **Data**: Minimal, intention-revealing (e.g. `{ issue: { id: 42, subject: "Test" } }`). No shared mutable state between tests.

## Schema and Validation

- **Zod schemas**: Test with `schema.parse(valid)` and `expect(() => schema.parse(invalid)).toThrow()`. Cover allowed values and explicit rejections (e.g. positive int only; 0 and negative rejected).
- **Tool input**: Test the exported input schema (e.g. `getIssueInputSchema`) so MCP tool validation behavior is documented by tests.

## Coverage

- No numeric coverage target or CI threshold today. Prefer critical-path coverage: use case, adapter success/failure/retry-boundary, config validation, and tool input schema. Add thresholds only when the team agrees and can maintain them.

---
_Focus on patterns and decisions. Tool-specific config (e.g. bun test options) lives in package.json or project docs._
