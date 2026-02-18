import { describe, expect, it } from "bun:test";
import { parseConfigEnv } from "./config-env.adapter.js";

describe("parseConfigEnv", () => {
  it("有効な REDMINE_URL と REDMINE_API_KEY で { baseUrl, apiKey } を返す", () => {
    const env = {
      REDMINE_URL: "https://redmine.example.com",
      REDMINE_API_KEY: "secret-key",
    };
    const got = parseConfigEnv(env);
    expect(got).toEqual({
      baseUrl: "https://redmine.example.com",
      apiKey: "secret-key",
    });
  });

  it("REDMINE_URL 末尾のスラッシュを除去する", () => {
    const env = {
      REDMINE_URL: "https://redmine.example.com/",
      REDMINE_API_KEY: "key",
    };
    const got = parseConfigEnv(env);
    expect(got.baseUrl).toBe("https://redmine.example.com");
  });

  it("REDMINE_URL が無効な URL のとき throw する", () => {
    const env = {
      REDMINE_URL: "not-a-url",
      REDMINE_API_KEY: "key",
    };
    expect(() => parseConfigEnv(env)).toThrow("設定エラー:");
    expect(() => parseConfigEnv(env)).toThrow("REDMINE_URL");
  });

  it("REDMINE_API_KEY が空のとき throw する", () => {
    const env = {
      REDMINE_URL: "https://redmine.example.com",
      REDMINE_API_KEY: "",
    };
    expect(() => parseConfigEnv(env)).toThrow("設定エラー:");
    expect(() => parseConfigEnv(env)).toThrow("REDMINE_API_KEY");
  });

  it("REDMINE_API_KEY が未設定のとき throw する", () => {
    const env = {
      REDMINE_URL: "https://redmine.example.com",
    };
    expect(() => parseConfigEnv(env)).toThrow("設定エラー:");
  });
});
