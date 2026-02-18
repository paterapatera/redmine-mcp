# Technology Stack

## Architecture

Single-process MCP server: Bun runs the built CommonJS bundle; MCP SDK handles stdio transport and tool/resource registration. Redmine is accessed via REST API with env-configured URL and API key.

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

### Testing

- `bun test` for unit tests; E2E via MCP Inspector (`bun run inspector`)

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
