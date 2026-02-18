import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FetchIssueUseCase } from "../application/fetch-issue-use-case.js";

/** ツール名。MCP のツール定義に従う。 */
export const GET_ISSUE_TOOL_NAME = "redmine_get_issue";

/** issue_id の入力スキーマ（正整数）。不正時は MCP のバリデーションエラーとなる。 */
export const getIssueInputSchema = z.object({
  issue_id: z.coerce.number().int().positive("issue_id は正整数である必要があります"),
});

export type GetIssueToolArgs = z.infer<typeof getIssueInputSchema>;

/**
 * MCP の「イシュー取得」ツールを登録する。
 * 入力検証後 FetchIssueUseCase を呼び、結果を MCP ツールレスポンスにそのままマッピングする。
 * @param server - ツールを登録する MCP サーバー
 * @param useCase - イシュー取得ユースケース
 */
export function registerGetIssueTool(
  server: McpServer,
  useCase: FetchIssueUseCase,
): void {
  server.registerTool(
    GET_ISSUE_TOOL_NAME,
    {
      description:
        "指定した ID の Redmine イシューを 1 件取得する。journals, children, relations を含む。",
      inputSchema: getIssueInputSchema,
    },
    async (args) => {
      // design Monitoring: ツール呼び出し開始をログ。body は含めない。
      console.log(
        JSON.stringify({ event: "get_issue_start", issue_id: args.issue_id }),
      );
      const result = await useCase.execute(args.issue_id);
      if (result.ok) {
        console.log(
          JSON.stringify({ event: "get_issue_success", issue_id: args.issue_id }),
        );
        const text =
          typeof result.body === "string"
            ? result.body
            : JSON.stringify(result.body);
        return { content: [{ type: "text" as const, text }] };
      }
      console.log(
        JSON.stringify({
          event: "get_issue_failure",
          issue_id: args.issue_id,
          status: result.status,
        }),
      );
      // status と body を改変せずエージェントへ渡す。部分的なデータや曖昧な失敗表現は返さない。
      const payload = { statusCode: result.status, body: result.body };
      const text =
        typeof result.body === "string"
          ? JSON.stringify(payload)
          : JSON.stringify(payload);
      return {
        content: [{ type: "text" as const, text }],
        isError: true,
      };
    },
  );
}
