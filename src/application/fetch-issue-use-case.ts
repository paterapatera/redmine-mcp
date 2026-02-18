import type { FetchIssueResult } from "../domain/fetch-issue-result.js";
import type { IRedmineGateway } from "./ports.js";

/**
 * イシュー ID を指定して取得するアプリケーションルール。
 * Gateway（Port）を呼び、その結果を改変せずに返す。
 */
export class FetchIssueUseCase {
  constructor(private readonly gateway: IRedmineGateway) {}

  /**
   * 指定した ID のイシューを取得する。Gateway の戻り値をそのまま返す。
   * @param issueId - イシュー ID（正整数）
   * @returns Redmine の取得結果（成功時は body、失敗時は status と body）
   */
  async execute(issueId: number): Promise<FetchIssueResult> {
    return this.gateway.fetchIssue(issueId);
  }
}
