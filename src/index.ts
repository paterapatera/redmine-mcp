/**
 * MCP サーバーのエントリポイント。設定読込・DI・ツール登録のうえ stdio で接続する。
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfigEnv } from "./adapters/config-env.adapter.js";
import { RedmineHttpAdapter } from "./adapters/redmine-http.adapter.js";
import { registerGetIssueTool } from "./adapters/get-issue-tool.adapter.js";
import { FetchIssueUseCase } from "./application/fetch-issue-use-case.js";

async function main(): Promise<void> {
  const config = loadConfigEnv();
  const gateway = new RedmineHttpAdapter(config.baseUrl, config.apiKey);
  const useCase = new FetchIssueUseCase(gateway);
  const server = new McpServer({
    name: "redmine-mcp",
    version: "1.0.0",
  });
  registerGetIssueTool(server, useCase);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
