import type { FetchIssueResult } from "../domain/fetch-issue-result.js";
import type { IRedmineGateway } from "../application/ports.js";

/** Redmine の issues API で固定する include パラメータ。 */
const INCLUDE_PARAM = "journals,children,relations";

/** Redmine API リクエストに付与する認証ヘッダー名。 */
const API_KEY_HEADER = "X-Redmine-API-Key";

/** 5xx/429 リトライの最大回数（初回を除く再試行回数）。design: 最大 3 回。 */
const MAX_RETRIES = 3;

/** 初回リトライまでの待機時間（ミリ秒）。design: 1s。 */
const INITIAL_DELAY_MS = 1000;

/** リトライ間隔の倍率（指数バックオフ）。design: 1s → 2s → 4s。 */
const RETRY_MULTIPLIER = 2;

/**
 * 指定した HTTP ステータスがリトライ対象（5xx または 429）かどうか。
 * 5xx および 429 のみリトライし、4xx はリトライしない。
 */
function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * IRedmineGateway の HTTP 実装。
 * Redmine REST API に GET でイシュー 1 件を取得し、5xx/429 のときのみ指数バックオフでリトライする。
 * レスポンスは改変せず FetchIssueResult で返す。
 */
export class RedmineHttpAdapter implements IRedmineGateway {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  /**
   * 指定した ID のイシューを取得する。
   * include=journals,children,relations を固定で付与し、X-Redmine-API-Key で認証する。
   * 5xx/429 のときは指数バックオフで最大 MAX_RETRIES 回までリトライする。
   * @param issueId - イシュー ID（正整数）
   * @returns 成功時は body をそのまま、失敗時は status と body をそのまま返す
   */
  async fetchIssue(issueId: number): Promise<FetchIssueResult> {
    const url = `${this.baseUrl}/issues/${issueId}.json?include=${INCLUDE_PARAM}`;
    const headers: Record<string, string> = {
      [API_KEY_HEADER]: this.apiKey,
    };

    // design Monitoring: リクエスト開始をログ。API キーや body は含めない。
    console.log(JSON.stringify({ event: "fetch_issue_start", issueId }));

    let lastResult: FetchIssueResult | null = null;
    let delayMs = INITIAL_DELAY_MS;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(
          JSON.stringify({ event: "fetch_issue_retry", issueId, attempt }),
        );
        await Bun.sleep(delayMs);
        delayMs *= RETRY_MULTIPLIER;
      }

      let res: Response;
      let body: unknown;
      try {
        res = await fetch(url, { headers });
        const text = await res.text();
        if (text.length === 0) {
          body = null;
        } else {
          try {
            body = JSON.parse(text) as unknown;
          } catch {
            body = { _raw: text };
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.log(
          JSON.stringify({ event: "fetch_issue_failure", issueId, status: 0 }),
        );
        return {
          ok: false,
          status: 0,
          body: { error: "fetch_failed", message },
        };
      }

      if (res.ok) {
        console.log(JSON.stringify({ event: "fetch_issue_success", issueId }));
        return { ok: true, body };
      }

      lastResult = { ok: false, status: res.status, body };
      if (!isRetryableStatus(res.status)) {
        console.log(
          JSON.stringify({
            event: "fetch_issue_failure",
            issueId,
            status: res.status,
          }),
        );
        return lastResult;
      }
    }

    const final = lastResult as { ok: false; status: number; body: unknown };
    console.log(
      JSON.stringify({
        event: "fetch_issue_failure",
        issueId,
        status: final.status,
        retries: MAX_RETRIES,
      }),
    );
    return final;
  }
}
