# Research & Design Decisions Template

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

**Usage**:
- Log research activities and outcomes during the discovery phase.
- Document design decision trade-offs that are too detailed for `design.md`.
- Provide references and evidence for future audits or reuse.
---

## Summary

- **Feature**: redmine-issue-fetch
- **Discovery Scope**: Extension（既存 MCP サーバー製品への初回機能追加；コードベースは未実装のため実質グリーンフィールド）
- **Key Findings**:
  - Redmine REST API の単一イシュー取得は `GET /issues/[id].json?include=journals,children,relations` で仕様どおり取得可能。一覧 API では `journals`/`children` は非対応のため、本機能は単一取得に限定する設計で正しい。
  - 認証は `X-Redmine-API-Key` ヘッダー。エラー時は HTTP ステータスと JSON をそのまま渡すため、Adapter 側でリトライ判定（5xx/429）と指数バックオフを実装する。
  - クリーンアーキテクチャを採用。Domain（FetchIssueResult）→ Application（IRedmineGateway + FetchIssueUseCase）→ Adapters（RedmineHttpAdapter, ConfigEnvAdapter, GetIssueToolAdapter）→ Main（index）の依存方向で、steering の単一エントリ・相対 import を維持する。

## Research Log

### Redmine REST API：単一イシュー取得と include

- **Context**: 要件で `journals`, `children`, `relations` を固定で含めるため、API 仕様を確認した。
- **Sources Consulted**: [Rest Issues - Redmine](https://www.redmine.org/projects/redmine/wiki/rest_issues)、コミュニティ投稿（include=children の単一取得対応）
- **Findings**:
  - `GET /issues/[id].json` で `include=attachments,journals` が公式に記載。`relations` は一覧 API の include に記載あり。単一取得でも `relations` は多くの環境で利用可能。
  - `children` は一覧 API では返らないが、単一イシュー取得 `GET /issues/[id].json?include=children` では取得できることがコミュニティで言及されている。
  - 本機能は単一 ID 指定のみのため、`GET /issues/{id}.json?include=journals,children,relations` を前提に設計してよい。
- **Implications**: Redmine クライアントは上記 URL を 1 回呼び出し、取得した JSON をそのまま MCP ツールの戻り値に載せる。

### 認証とエラー・リトライ

- **Context**: 認証方式とエラー時「そのまま渡す」、5xx/429 のリトライ方針を設計に反映する。
- **Sources Consulted**: 要件 Clarifications、steering（env-based config）
- **Findings**:
  - 認証は `X-Redmine-API-Key` のみ。環境変数 `REDMINE_API_KEY` を読み、全 Redmine リクエストに付与する。
  - エラー時は Redmine の HTTP ステータスと JSON を改変せずエージェントへ渡すため、MCP ツールの戻り型は「成功時は issue オブジェクト、失敗時は status + body をそのまま返す」形が適切。
  - リトライは 5xx/429 のみ、指数バックオフ。最大リトライ回数・初回待機時間・最大待機時間は設計で定義する（実装詳細は design に簡潔に記載）。
- **Implications**: Redmine クライアント層でリトライを実装し、ツールハンドラは「1 回の成功レスポンス」または「最終失敗レスポンス」のみ扱う。

### 既存コードベースと steering 整合

- **Context**: `src/` 配下に TypeScript が存在しないため、steering のディレクトリ・責務分離のみ参照。
- **Sources Consulted**: docs/steering/structure.md, tech.md, product.md
- **Findings**:
  - エントリは `src/index.ts`。Redmine アクセスと MCP ツール登録は分離（例: `redmine.ts`, `tools.ts`）。設定は起動時に Zod で検証。
  - Bun + TypeScript、MCP SDK、Zod。パスエイリアスなし、相対 import。
- **Implications**: 新規コンポーネントは Redmine クライアントと MCP ツールハンドラに分け、設定は env から読み検証するモジュールを 1 つ置く。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 単一レイヤ + 薄いクライアント | index が MCP を立て、ツールハンドラが Redmine クライアントを呼ぶだけ | 実装が単純 | テスト時に HTTP を必ずモックする必要、責務の境界が曖昧 | 見送り |
| ヘキサゴナル | ユースケース層を挟みポート/アダプタで抽象化 | テスト容易、差し替え可能 | 用語・レイヤ名がプロジェクトで統一されていない場合がある | クリーンアーキテクチャで統合 |
| **クリーンアーキテクチャ** | Entity → Use Case → Interface Adapters → Frameworks。依存は内側向き。Port（インターフェース）と Adapter（実装）で I/O を抽象化 | 依存逆転でユースケースがフレームワークに依存しない、テストで Gateway をモック可能、将来の他ツールでも同一 Port/Use Case を再利用可能 | ファイル数・ディレクトリが増える | **採用** |

## Design Decisions

### Decision: クリーンアーキテクチャの採用

- **Context**: 保守性・テスト容易性・将来の拡張（他ツール・他データソース）を考慮し、アーキテクチャパターンを明確にしたい。
- **Alternatives Considered**:
  1. 単一レイヤ + 薄いクライアント — シンプルだが、HTTP と MCP の責務が Adapter に混在し、ユースケースの単体テストで必ず HTTP をモックする必要がある。
  2. ヘキサゴナル — ポート/アダプタの考え方は同じだが、用語をクリーンアーキテクチャに揃えることで「Domain / Application / Adapters / Main」の境界を設計書と実装で一致させられる。
  3. クリーンアーキテクチャ — Domain（型のみ）・Application（Use Case + Port）・Adapters（Gateway 実装・Config・MCP ツール）・Main の 4 層で、依存を内側向きにし、テスト時は IRedmineGateway をモックして Use Case を単体テストできる。
- **Selected Approach**: クリーンアーキテクチャを採用。Domain に FetchIssueResult、Application に IRedmineGateway と FetchIssueUseCase、Adapters に RedmineHttpAdapter・ConfigEnvAdapter・GetIssueToolAdapter を配置する。
- **Rationale**: リトライ・認証・HTTP は「Redmine にどう取りに行くか」の詳細なので Adapter に閉じ、Use Case は「ID で取得する」というアプリケーションルールのみを持つ。これにより、Gateway を差し替え可能にし、E2E 以外ではモックで十分に検証できる。
- **Trade-offs**: ファイル数とディレクトリが増えるが、steering の「flat or lightly grouped」を `domain/` `application/` `adapters/` で満たす。
- **Follow-up**: 実装時に import パス（相対）とレイヤ間の依存が逆転していることを linter やテストで確認する。

### Decision: Redmine 取得と MCP ツールの境界（クリーンアーキテクチャ下）

- **Context**: 要件 2（ペイロードそのまま）と 3（エラーそのまま）を満たしつつ、リトライは「Redmine に取りに行く」詳細として Adapter に閉じたい。
- **Alternatives Considered**:
  1. ツールハンドラ内で fetch + リトライ — MCP と HTTP が混在し、Use Case がテストしづらい。
  2. Application に IRedmineGateway を置き、Adapter（RedmineHttpAdapter）が HTTP・リトライ・認証を実装。Use Case は Gateway を呼ぶだけ。Tool Adapter は Use Case の結果を MCP レスポンスにマッピングする。
- **Selected Approach**: 2。Gateway（Port）が「1 回の成功 or 最終失敗」を表す FetchIssueResult を返し、Use Case はそれをそのまま返す。RedmineHttpAdapter が HTTP・リトライ・認証を担当し、GetIssueToolAdapter が入力検証と結果の MCP 形式への変換のみ行う。
- **Rationale**: 単一責任、Use Case の単体テストで Gateway をモック可能、将来の検索ツールでも同一 Port/Use Case を再利用できる。
- **Trade-offs**: FetchIssueResult を Domain に置き、Application と Adapters で共有する。discriminated union で判別可能にする。
- **Follow-up**: 実装で FetchIssueResult と IRedmineGateway を具体的に定義し、E2E で 404/403/500 を検証する。

### Decision: include の固定値

- **Context**: 要件 1.2 で `journals`, `children`, `relations` のみ固定。
- **Alternatives Considered**:
  1. ツールの入力パラメータで include を指定可能にする — 要件外かつ「そのまま渡す」の一貫性が崩れうる。
  2. 固定で `journals,children,relations` のみ渡す。
- **Selected Approach**: 2。クライアントの「イシュー 1 件取得」は常に `?include=journals,children,relations` を付与する。
- **Rationale**: 要件・Clarifications のとおり。シンプルで検証しやすい。
- **Trade-offs**: 将来「include を選びたい」という要望が出た場合は別要件・別ツールとして検討する。
- **Follow-up**: なし。

### Decision: リトライパラメータ

- **Context**: 指数バックオフで 5xx/429 のみリトライするが、回数・時間は要件に未記載。
- **Alternatives Considered**:
  1. 固定値（例: 最大 3 回、初回 1s、倍率 2）を設計に明記。
  2. 環境変数で設定可能にする。
- **Selected Approach**: 設計では「最大リトライ回数」「初回遅延」「倍率」を表で定義し、初期値は固定。環境変数化は Non-Goals または将来拡張とする。
- **Rationale**: 実装の一意性を保ちつつ、必要なら後から設定化できる。
- **Trade-offs**: 運用で変更したい場合はコード変更または設定拡張が必要。
- **Follow-up**: 実装時に定数名と値をコード内に明示する。

## Risks & Mitigations

- **Redmine のバージョン差で `children` が効かない** — 公式 wiki に単一取得の include 一覧が不足している。実装と E2E で Redmine 実機にて `include=children` を確認し、動作しなければ research/design に注記を追加。
- **ペイロードが非常に大きい** — 成功時はそのまま渡す方針のため、巨大な journals でメモリやレスポンスサイズが増える。現状は Non-Goal（制限なし）。必要なら将来「最大 journal 数」などを別要件で検討。
- **API キー漏洩** — 環境変数のみで保持し、ログやエラーメッセージに含めない。設計の Security で一言記載。

## References

- [Redmine REST API: Issues](https://www.redmine.org/projects/redmine/wiki/rest_issues) — 単一イシュー取得と include の仕様
- 本リポジトリ `docs/steering/` — 構成・技術スタック・製品方針
