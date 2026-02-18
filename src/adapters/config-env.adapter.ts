import { z } from "zod";

/** 起動時設定の検証スキーマ。REDMINE_URL と REDMINE_API_KEY を必須とする。 */
const envSchema = z.object({
  REDMINE_URL: z.string().url("REDMINE_URL は有効な URL である必要があります"),
  REDMINE_API_KEY: z.string().min(1, "REDMINE_API_KEY は必須です"),
});

/** 検証済み設定の型。baseUrl と apiKey を公開する。 */
export type ConfigEnv = {
  baseUrl: string;
  apiKey: string;
};

/**
 * 環境変数オブジェクトを検証し、ConfigEnv を返す。
 * 検証失敗時はエラーメッセージ付きで throw する（単体テスト用に export）。
 * @param env - 環境変数オブジェクト（process.env 相当）
 * @returns 検証済みの { baseUrl, apiKey }（末尾スラッシュは除去）
 */
export function parseConfigEnv(
  env: Record<string, string | undefined>,
): ConfigEnv {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const msg =
      typeof parsed.error.message === "string"
        ? parsed.error.message
        : String(parsed.error);
    throw new Error(`設定エラー: ${msg}`);
  }
  const { REDMINE_URL, REDMINE_API_KEY } = parsed.data;
  return {
    baseUrl: REDMINE_URL.replace(/\/$/, ""),
    apiKey: REDMINE_API_KEY,
  };
}

/**
 * 起動時に REDMINE_URL と REDMINE_API_KEY を読み、Zod で検証する。
 * 検証失敗時はメッセージを出してプロセスを終了する。
 * @returns 検証済みの { baseUrl, apiKey }
 */
export function loadConfigEnv(): ConfigEnv {
  try {
    return parseConfigEnv(process.env as Record<string, string | undefined>);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  }
}
