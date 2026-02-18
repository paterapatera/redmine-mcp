# Requirements Document

## Introduction

本仕様は、Redmine MCP Server がエージェント向けに「ID指定でRedmineイシューを1件取得し、journals・children・relations を含む詳細を改変せずに渡す」機能を定義する。認証は `X-Redmine-API-Key`、エラー時は Redmine の HTTP ステータスと JSON をそのまま渡し、5xx/429 には指数バックオフでリトライする。

## Project Description (Input)

エージェントとして、ID指定でRedmineイシューを取得し、journals/children/relationsを含め、受け取ったJSONをそのまま渡す。

---

## Requirements

### Session 2026-02-12

- Q: エラー時のレスポンスはどの形式でエージェントに渡すべきか？ → A: RedmineのHTTPステータスとJSONレスポンスをそのままエージェントに渡す。
- Q: 認証方式はどれを前提とするか？ → A: `X-Redmine-API-Key` ヘッダーでAPIキー認証。
- Q: リトライ方針はどうするか？ → A: 5xx/429のみ指数バックオフでリトライする。
- Q: 成功時のデータ整形はどうするか？ → A: RedmineのJSONをそのまま丸ごと渡す。
- Q: 取得対象の拡張（include指定）はどうするか？ → A: `journals,children,relations` のみ固定で取得する。

### 1. イシュー取得（ID指定・include固定）

**Objective:** As an エージェント, I want ID指定でRedmineイシューを1件取得できる, so that 十分な文脈を持って回答できる。

#### Acceptance Criteria

1. When エージェントが有効なイシューIDを指定してイシュー取得を要求する, the system shall Redmine REST API を用いて当該イシューを取得する。
2. The system shall 取得時に `journals`, `children`, `relations` のみを固定で include パラメータに含めて要求する。
3. When イシューに journals, children, relations が存在する, the system shall それらを含むイシュー詳細をエージェントに返す。
4. When イシューに journals, children, relations が存在しない, the system shall それらの項目を空の集合または明確に存在しない形で返し、他のイシューデータを欠損させない。

### 2. レスポンスの完全性（成功時）

**Objective:** As an エージェント, I want 取得したイシューのペイロードが改変されずに渡される, so that 後続の判断が正確な元データに基づいて行える。

#### Acceptance Criteria

1. When イシュー取得が成功した, the system shall Redmine から受け取った JSON ペイロードを改変せずにエージェントへ渡す。
2. The system shall 成功レスポンスにおいて取得元ペイロードの内容を変換・省略・付加しない。

### 3. エラー応答（未存在・権限不足・その他）

**Objective:** As an エージェント, I want 取得できない場合に明確なエラー結果を受け取る, so that 依頼者へ原因（未存在・権限不足など）を説明できる。

#### Acceptance Criteria

1. When 指定されたイシューIDが存在しない, the system shall 未存在であることが分かる結果をエージェントに返す。
2. When イシューは存在するがアクセス権がない, the system shall 権限不足であることが分かる結果をエージェントに返す。
3. When エラーが発生した（未存在・権限不足・その他）, the system shall Redmine の HTTP ステータスと JSON レスポンスを改変せずにエージェントへ渡す。
4. The system shall 部分的なデータや曖昧な失敗表現を返さず、明確な失敗結果のみを返す。

### 4. 認証

**Objective:** As a 運用者, I want APIキーで認証される, so that 安全に Redmine にアクセスできる。

#### Acceptance Criteria

1. The system shall Redmine API へのリクエストに `X-Redmine-API-Key` ヘッダーを用いた API キー認証を使用する。
2. When 認証情報が不正または欠如している, the system shall Redmine が返す HTTP ステータスと JSON をそのままエージェントに渡す。

### 5. リトライ（5xx / 429）

**Objective:** As a 運用者, I want 一時的なサーバーエラーやレート制限に対してリトライされる, so that 偶発的な失敗で取得が諦められない。

#### Acceptance Criteria

1. When Redmine が HTTP 5xx を返す, the system shall 指数バックオフでリトライする。
2. When Redmine が HTTP 429 を返す, the system shall 指数バックオフでリトライする。
3. The system shall 5xx および 429 以外の HTTP ステータスに対してはリトライを行わない（例: 4xx の未存在・権限不足はリトライしない）。

---

## Key Entities

- **Issue**: 主要な作業項目。項目の値と状態を含む。
- **Journal Entry**: イシューに紐づく履歴更新またはコメント。
- **Relation**: イシュー間の関連（例: ブロック、重複、関連）。
- **Child Issue**: 親イシューに紐づく子イシュー。

## Assumptions

- Redmine のベース URL はエージェント側（環境変数等）で設定済みである。
- エージェントには `X-Redmine-API-Key` で使用する有効な API キーとアクセス権がある。
- 依頼者から渡されるイシュー ID は有効な形式であることを前提とする。

## Success Criteria

- **SC-001**: 成功したリクエストの 95% で、存在する journals, children, relations が含まれる。
- **SC-002**: 通常負荷下で、成功したリクエストの 95% が 3 秒以内に結果を受け取れる。
- **SC-003**: 成功レスポンスの 100% で、取得元ペイロードの内容が改変されていない。
- **SC-004**: 失敗リクエストの 90% で、利用者が理解できる理由（未存在または権限不足）が返る。
