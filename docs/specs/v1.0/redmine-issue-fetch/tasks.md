# Tasks: redmine-issue-fetch

**Input**: Spec documents from `docs/specs/v1.0/redmine-issue-fetch/`
**Prerequisites**: requirements.md (required), design.md (required), research.md

**Tests**: 本仕様ではテストタスクは明示的に要求されていないため、実装タスクのみ記載する。

**Organization**: 要件ごとにタスクをグループ化し、各要件を独立して実装・検証できるようにする。

## Format: `[ID] [P?] [Requirement] Description`

- **[P]**: 並列実行可能（別ファイル、他タスクへの依存なし）
- **[Requirement]**: 対応する要件 ID（1.1, 1.2, 2.1 … design.md のトレーサビリティと一致）
- 説明には対象ファイルのパスを明記する

## Path Conventions

- ソース: `src/`（design.md の File Tree に準拠）
- エントリ: `src/index.ts`
- レイヤ: `src/domain/`, `src/application/`, `src/adapters/`

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: プロジェクト構造とビルド基盤の準備

- [x] T001 Create project structure: `src/domain/`, `src/application/`, `src/adapters/` and ensure `src/index.ts` exists; verify `package.json` and `tsconfig.json` per docs/steering/tech.md and design.md File Tree

---

## Phase 2: Foundational（ブロッキング前提）

**Purpose**: 全要件に共通する型・ポート・ユースケース・設定読込。この Phase 完了まで要件別実装を開始しない。

- [x] T002 [P] Create FetchIssueResult type (discriminated union ok/body, error status+body) in src/domain/fetch-issue-result.ts
- [x] T003 [P] Define IRedmineGateway interface in src/application/ports.ts (fetchIssue(issueId: number) => Promise<FetchIssueResult>)
- [x] T005 [P] [4.1] Create ConfigEnvAdapter in src/adapters/config-env.adapter.ts: read REDMINE_URL and REDMINE_API_KEY, validate with Zod, return { baseUrl, apiKey }; fail startup on validation error
- [x] T004 Create FetchIssueUseCase in src/application/fetch-issue-use-case.ts that delegates to IRedmineGateway and returns result unchanged (depends on T002, T003)

---

## Phase 3: Requirement 1 - イシュー取得（ID指定・include固定）＆ Requirement 2 - レスポンス完全性

**Objective**: ID 指定で Redmine から 1 件取得し、journals/children/relations を固定で含め、成功時はペイロードを改変せず返す。

**Independent Test**: MCP ツールで有効な issue_id を指定し、返却 JSON に issue と journals/children/relations が含まれること、内容が Redmine のレスポンスと一致することを確認する。

- [x] T006 [1.1] [1.2] [2.1] [2.2] [3.3] [4.1] Implement RedmineHttpAdapter in src/adapters/redmine-http.adapter.ts: GET {baseUrl}/issues/{id}.json?include=journals,children,relations, X-Redmine-API-Key header from config, return FetchIssueResult (ok with body unchanged / error with status and body unchanged); do not retry on 4xx
- [x] T007 [1.1] [1.3] [1.4] [2.1] [2.2] [3.1] [3.2] [3.3] [3.4] Implement GetIssueToolAdapter in src/adapters/get-issue-tool.adapter.ts: validate issue_id (positive integer), call FetchIssueUseCase.execute, map FetchIssueResult to MCP tool response (success: body as content; failure: status and body unchanged)
- [x] T008 [1.1] Wire in src/index.ts: load config via ConfigEnvAdapter, create RedmineHttpAdapter and FetchIssueUseCase, create GetIssueToolAdapter, register MCP tool and start server

---

## Phase 4: Requirement 3 - エラー応答

**Objective**: 未存在・権限不足・その他のエラー時に Redmine の HTTP ステータスと JSON を改変せずエージェントに渡す。

**Independent Test**: 存在しない ID で 404、権限のないイシューで 403 相当が返り、レスポンスに status と body がそのまま含まれることを確認する。

- [x] T009 [3.1] [3.2] [3.3] [3.4] Ensure RedmineHttpAdapter and GetIssueToolAdapter error path: return FetchIssueResult with ok: false, status and body from Redmine unchanged; no partial or ambiguous failure representation (verify in src/adapters/redmine-http.adapter.ts and src/adapters/get-issue-tool.adapter.ts)

---

## Phase 5: Requirement 5 - リトライ（5xx / 429）

**Objective**: 5xx および 429 の場合のみ指数バックオフでリトライする。4xx はリトライしない。

**Independent Test**: モックまたは実機で 500/429 を返すとリトライが発生し、最終成功または最終失敗の status/body がそのまま返ることを確認する。

- [x] T010 [5.1] [5.2] [5.3] Add exponential backoff retry in src/adapters/redmine-http.adapter.ts for HTTP 5xx and 429 only (fixed max retries, initial delay, multiplier per design); do not retry on 4xx or 2xx

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数要件にまたがるログ・監視の方針適用

- [x] T011 Add structured logging in src/adapters (redmine-http.adapter.ts, get-issue-tool.adapter.ts as needed): request start, success/failure, retry count; do not log API key or response body content (per design Monitoring and docs/steering/tech.md)

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: 依存なし。T001 から開始。
- **Phase 2 (Foundational)**: T001 完了後に実施。T002, T003, T005 は [P] で並列可能。T004 は T002, T003 に依存。
- **Phase 3**: T002–T005 完了後に実施。T006 → T007 → T008 の順（T008 は T006, T007 に依存）。
- **Phase 4**: T009 は T006, T007 のエラー経路の確認・補強。Phase 3 完了後に実施。
- **Phase 5**: T010 は RedmineHttpAdapter の拡張。T006 完了後に実施可能。
- **Phase 6**: 全要件実装後に T011 でログを追加。

## Requirements Coverage

| Req | Task IDs |
|-----|----------|
| 1.1 | T006, T007, T008 |
| 1.2 | T006 |
| 1.3, 1.4 | T006, T007 |
| 2.1, 2.2 | T006, T007 |
| 3.1–3.4 | T006, T007, T009 |
| 4.1 | T005, T006 |
| 4.2 | T007（エラー経路） |
| 5.1–5.3 | T010 |
