# Technology Stack

## Architecture

Single-process MCP server: Bun runs the built CommonJS bundle; MCP SDK handles stdio transport and tool/resource registration. Redmine is accessed via REST API with env-configured URL and API key.

- **Clean Architecture**: The project adopts Clean Architecture. Dependencies point inward: Domain (entities/types) → Application (use cases, ports) → Adapters (implementations, I/O) → Main (wiring). Ports are interfaces defined in the application layer; adapters implement them. See feature specs (e.g. `docs/specs/`) for layer boundaries and file layout.

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Runtime**: Bun >= 1.2.21
- **Build**: `bun build ./src/index.ts --outdir ./dist --target bun`; output is CommonJS in `dist/`
- **Protocol**: Model Context Protocol via `@modelcontextprotocol/sdk`
- **Validation**: Zod for schemas and input validation

## Key Libraries

- `@modelcontextprotocol/sdk`: MCP server, tools, resources
- `zod`: Request/response and config validation

## Development Standards

### Type Safety

- `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `forceConsistentCasingInFileNames`
- Source in `src/`; `rootDir: "./src"`, `outDir: "./dist"`

### Code Quality

- ESLint with `@typescript-eslint` (plugin + parser)
- Prettier (single quotes, 100 print width, 2-space indent, LF, semicolons)
- **Method length**: Aim for 10 lines or fewer per method; extract helpers or smaller functions when logic grows.
- **File length**: Aim for 200 lines or fewer per file; split by responsibility or layer when larger.

### Comments and Documentation

- **Symbol comments (Japanese)**: Add explanation comments in Japanese for class names, function names (excluding constructors), property names, and constant names. Target: newly added or changed symbols. In TypeScript, prefer **TSDoc** format (e.g. `/** ... */`).
- **Intent for non-obvious code**: For implementations that are hard to follow or use a non-obvious approach, document intent with a `NOTE: {説明}` comment so that future readers understand why it is written that way.
- **Concrete wording**: In comments, avoid vague pronouns (e.g. 「それ」「これ」); use concrete nouns and refer to the actual subject explicitly.
- **Unambiguous comments**: If a comment can be misunderstood or supports more than one interpretation, rewrite it so that the meaning is clear and single.
- **Complex functions**: For functions whose behavior is not obvious from the name or a short description, add input/output examples or a brief usage example in the comment (e.g. in TSDoc `@example` or an inline example block).

### Testing

- `bun test` for unit tests; E2E via MCP Inspector (`bun run inspector`). Test files: `*.test.ts` alongside source; mocking and structure: **`testing.md`**.

## Development Environment

### Required Tools

- Bun v1.2.21+
- Node/npm only as needed (e.g. `npx @modelcontextprotocol/inspector`)

### Common Commands

```bash
# Dev / test
bun test
bun test --watch

# Build
bun run build

# Format
bun run format
bun run format:check

# E2E (after setting REDMINE_API_KEY, REDMINE_URL)
bun run inspector
```

## Key Technical Decisions

- **Bun over Node**: Primary runtime and bundler; faster install and run, native TypeScript.
- **CommonJS output**: Compatibility with MCP clients that run the built script; `bin` points to `dist/index.js`.
- **No path aliases**: Imports from `src/` use relative paths; no `@/` or similar in tsconfig for build.
- **Env-based config**: No config files for secrets; `REDMINE_API_KEY` and `REDMINE_URL` required at runtime.

---
_Document standards and patterns, not every dependency_
