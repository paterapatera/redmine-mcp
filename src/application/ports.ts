import type { FetchIssueResult } from "../domain/fetch-issue-result.js";

/**
 * Redmine からイシューを 1 件取得する抽象（Port）。
 * 実装は Adapters が担当する（HTTP・リトライ・認証の詳細は Application から見えない）。
 */
export interface IRedmineGateway {
  /**
   * 指定した ID のイシューを取得する。
   * @param issueId - イシュー ID（正整数）
   * @returns 成功時は body を Redmine のレスポンスそのまま、失敗時は status と body をそのまま返す
   */
  fetchIssue(issueId: number): Promise<FetchIssueResult>;
}
