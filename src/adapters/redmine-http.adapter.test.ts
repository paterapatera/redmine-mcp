import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { RedmineHttpAdapter } from "./redmine-http.adapter.js";

const realFetch = globalThis.fetch;
const realBunSleep = globalThis.Bun?.sleep;

describe("RedmineHttpAdapter", () => {
  const baseUrl = "https://redmine.test";
  const apiKey = "test-api-key";

  let fetchMock: ReturnType<typeof mock>;
  let sleepMock: ReturnType<typeof mock>;

  beforeEach(() => {
    fetchMock = mock((url: string | URL) => {
      const u = typeof url === "string" ? url : url.toString();
      if (u.includes("/issues/42.json")) {
        return Promise.resolve(
          new Response(JSON.stringify({ issue: { id: 42, subject: "Test" } }), {
            status: 200,
          }),
        );
      }
      if (u.includes("/issues/404.json")) {
        return Promise.resolve(
          new Response(JSON.stringify({ errors: ["Not found"] }), {
            status: 404,
          }),
        );
      }
      if (u.includes("/issues/500.json")) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({}), { status: 404 }),
      );
    });
    sleepMock = mock(() => Promise.resolve());
    globalThis.fetch = fetchMock as typeof fetch;
    if (globalThis.Bun) {
      globalThis.Bun.sleep = sleepMock as (ms: number) => Promise<void>;
    }
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    if (globalThis.Bun && realBunSleep) {
      globalThis.Bun.sleep = realBunSleep;
    }
  });

  it("2xx のとき { ok: true, body } を返す", async () => {
    const adapter = new RedmineHttpAdapter(baseUrl, apiKey);
    const result = await adapter.fetchIssue(42);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body).toEqual({ issue: { id: 42, subject: "Test" } });
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/issues/42.json");
    expect(url).toContain("include=journals,children,relations");
    expect((init?.headers as Record<string, string>)?.["X-Redmine-API-Key"]).toBe(apiKey);
  });

  it("4xx のとき { ok: false, status, body } を返しリトライしない", async () => {
    const adapter = new RedmineHttpAdapter(baseUrl, apiKey);
    const result = await adapter.fetchIssue(404);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
      expect(result.body).toEqual({ errors: ["Not found"] });
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).toHaveBeenCalledTimes(0);
  });

  it("fetch が例外のとき { ok: false, status: 0, body: { error, message } } を返す", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Network error")),
    ) as typeof fetch;
    const adapter = new RedmineHttpAdapter(baseUrl, apiKey);
    const result = await adapter.fetchIssue(1);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(0);
      expect(result.body).toEqual(
        expect.objectContaining({
          error: "fetch_failed",
          message: "Network error",
        }),
      );
    }
  });
});
