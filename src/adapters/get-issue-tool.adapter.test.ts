import { describe, expect, it } from "bun:test";
import { getIssueInputSchema } from "./get-issue-tool.adapter.js";

describe("getIssueInputSchema", () => {
  it("正整数の issue_id を許可する", () => {
    expect(getIssueInputSchema.parse({ issue_id: 1 })).toEqual({ issue_id: 1 });
    expect(getIssueInputSchema.parse({ issue_id: 42 })).toEqual({ issue_id: 42 });
    expect(getIssueInputSchema.parse({ issue_id: "100" })).toEqual({
      issue_id: 100,
    });
  });

  it("0 や負の数は拒否する", () => {
    expect(() => getIssueInputSchema.parse({ issue_id: 0 })).toThrow();
    expect(() => getIssueInputSchema.parse({ issue_id: -1 })).toThrow();
  });

  it("小数は拒否する", () => {
    expect(() => getIssueInputSchema.parse({ issue_id: 1.5 })).toThrow();
  });

  it("issue_id が無いと拒否する", () => {
    expect(() => getIssueInputSchema.parse({})).toThrow();
  });
});
