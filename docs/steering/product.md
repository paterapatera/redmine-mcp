# Product Overview

Redmine MCP Server is an MCP (Model Context Protocol) server that exposes Redmine issues to AI agents. It lets MCP clients (e.g. Claude Desktop, MCP Inspector) fetch and use Redmine issue data in a standard way.

## Core Capabilities

- **MCP protocol compliance**: Standard MCP server implementation; tools/resources as defined by the protocol.
- **Redmine issue access**: Fetch and search Redmine issues via the Redmine REST API.
- **Unified error handling**: Consistent error handling and reporting to clients.
- **Logging**: Structured logging for debugging and operations.

## Target Use Cases

- AI assistants (e.g. Claude) querying Redmine issues from the user’s environment.
- Local or CI usage via MCP Inspector for development and E2E checks.
- Integration with any MCP client using `redmine-mcp` (e.g. via `bun link` or direct path).

## Value Proposition

Single-purpose MCP server for Redmine: minimal setup (API key + base URL), no npm publish (local/link usage), and a clear contract for issue access so agents can work with Redmine without custom integrations.

---
_Focus on patterns and purpose, not exhaustive feature lists_
