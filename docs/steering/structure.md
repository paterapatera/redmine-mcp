# Project Structure

## Organization Philosophy

Source lives under `src/`; build output under `dist/`. Single entry `src/index.ts` for the MCP server. Structure is flat or lightly grouped by concern (e.g. Redmine client, tools, handlers) rather than by layer.

## Directory Patterns

### Source
**Location**: `/src/`  
**Purpose**: TypeScript source; entry `index.ts`, plus modules for Redmine API, MCP tools/resources, and shared utilities.  
**Example**: `src/index.ts`, `src/redmine.ts`, `src/tools.ts`

### Build output
**Location**: `/dist/`  
**Purpose**: Bundled output from `bun build`; `dist/index.js` is the binary entry.  
**Example**: `dist/index.js` (and any emitted declarations if enabled)

### Docs and settings
**Location**: `/docs/`  
**Purpose**: Steering (`docs/steering/`), specs (`docs/specs/`), and project settings/templates under `docs/settings/`. Not part of runtime.

## Naming Conventions

- **Files**: kebab-case or lowercase for scripts; match module purpose (e.g. `redmine.ts`, `tools.ts`).
- **Exports**: Clear names for MCP tools/resources and Redmine helpers; avoid generic names where the project is the only consumer.

## Import Organization

- Imports from within `src/` use relative paths (e.g. `./redmine`, `./tools`).
- No path aliases in tsconfig for the build; `rootDir` is `./src`, `outDir` is `./dist`.

## Code Organization Principles

- Entrypoint wires MCP server (SDK), registers tools/resources, and delegates to small modules.
- Redmine access and MCP tool handlers stay separate so API and protocol concerns are clear.
- Env (API key, base URL) is read at startup and validated (e.g. with Zod) before use.

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
