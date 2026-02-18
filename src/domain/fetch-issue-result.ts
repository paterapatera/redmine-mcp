/**
 * イシュー取得の結果を表す型。
 * 成功時は body（Redmine JSON）のみ、失敗時は status と body をそのまま持つ判別可能な共用体。
 */
export type FetchIssueResult =
  | { ok: true; body: unknown }
  | { ok: false; status: number; body: unknown };
