import { describe, expect, it, mock } from "bun:test";
import type { FetchIssueResult } from "../domain/fetch-issue-result.js";
import type { IRedmineGateway } from "./ports.js";
import { FetchIssueUseCase } from "./fetch-issue-use-case.js";

describe("FetchIssueUseCase", () => {
  it("execute は gateway.fetchIssue の結果をそのまま返す（成功）", async () => {
    const body = { issue: { id: 1, subject: "test" } };
    const gateway = {
      fetchIssue: mock((): Promise<FetchIssueResult> =>
        Promise.resolve({ ok: true, body }),
      ),
    } as unknown as IRedmineGateway;

    const useCase = new FetchIssueUseCase(gateway);
    const result = await useCase.execute(42);

    expect(gateway.fetchIssue).toHaveBeenCalledTimes(1);
    expect(gateway.fetchIssue).toHaveBeenCalledWith(42);
    expect(result).toEqual({ ok: true, body });
  });

  it("execute は gateway.fetchIssue の結果をそのまま返す（失敗）", async () => {
    const gateway = {
      fetchIssue: mock((): Promise<FetchIssueResult> =>
        Promise.resolve({
          ok: false,
          status: 404,
          body: { errors: ["Not found"] },
        }),
      ),
    } as unknown as IRedmineGateway;

    const useCase = new FetchIssueUseCase(gateway);
    const result = await useCase.execute(100);

    expect(gateway.fetchIssue).toHaveBeenCalledWith(100);
    expect(result).toEqual({
      ok: false,
      status: 404,
      body: { errors: ["Not found"] },
    });
  });
});
