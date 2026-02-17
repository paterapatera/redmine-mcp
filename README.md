# Redmine MCP Server

Redmine内のイシューを取得する MCP (Model Context Protocol) サーバーです。AI エージェントが Redmine のイシューを効率的に取得できるようにします。

## 概要

このプロジェクトは、MCP プロトコルに準拠したサーバーを実装し、Redmine のイシューを取得する機能を提供します。Claude Desktop やその他の MCP クライアントから使用できます。

## 主な機能

- ✅ **MCP プロトコル準拠**: 標準的な MCP サーバー実装
- ✅ **Redmine イシュー取得**: Redmine 内のイシューを取得
- ✅ **エラーハンドリング**: 統一されたエラーハンドリング戦略
- ✅ **ログ記録**: ログ記録

## 前提条件

- [Bun](https://bun.sh) v1.2.21 以降
- <!-- 必要な条件をここに追加 -->

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/paterapatera/redmine-mcp.git
cd redmine-mcp
```

### 2. 依存関係のインストール

```bash
bun install
```

### 3. 環境変数の設定

必須の環境変数：

```bash
export REDMINE_API_KEY="your-api-key-here"
export REDMINE_URL="https://redmine.example.com"
```

### 4. ビルド

```bash
bun run build
```

ビルド後、`dist/index.js` が生成されます。

## 使用方法

### bun link でインストール

ローカル開発環境で使用する場合、`bun link` を使用します：

```bash
# プロジェクトディレクトリで実行
bun link

# グローバルにリンクされた後、どこからでも実行可能
redmine-mcp
```

環境変数を指定する場合：

```bash
REDMINE_API_KEY="your-api-key-here" REDMINE_URL="https://redmine.example.com" redmine-mcp
```

### MCP クライアントとして使用

このサーバーは MCP クライアント（例: Claude Desktop, MCP Inspector）から使用されます。

#### Claude Desktop での設定

`claude_desktop_config.json` に以下を追加：

**bun link を使用する場合**（推奨）：

```json
{
  "mcpServers": {
    "redmine-mcp": {
      "command": "redmine-mcp",
      "env": {
        "REDMINE_API_KEY": "your-api-key-here",
        "REDMINE_URL": "https://redmine.example.com"
      }
    }
  }
}
```

`bun link` でグローバルにリンクされている場合、`redmine-mcp` コマンドが使用可能になります。

**ローカルパスを使用する場合**：

```json
{
  "mcpServers": {
    "redmine-mcp": {
      "command": "bun",
      "args": ["/path/to/redmine-mcp/dist/index.js"],
      "env": {
        "REDMINE_API_KEY": "your-api-key-here",
        "REDMINE_URL": "https://redmine.example.com"
      }
    }
  }
}
```

### 直接実行

```bash
bun dist/index.js
```

ただし、通常は MCP クライアント経由で使用します。

## テスト

### ユニットテスト

```bash
bun test
```

### MCP Inspector を使用した E2E テスト

MCP Inspector を使用してサーバーをテストする方法については、[MCP_INSPECTOR_GUIDE.md](./MCP_INSPECTOR_GUIDE.md) を参照してください。

簡単な手順：

```bash
# 1. 環境変数を設定
export REDMINE_API_KEY="your-api-key-here"
export REDMINE_URL="https://redmine.example.com"

# 2. ビルド
bun run build

# 3. MCP Inspector を起動
bun run inspector
```

## アーキテクチャ

<!--
  ACTION REQUIRED: このセクションには、プロジェクトのアーキテクチャに関する
  情報を記載してください。
-->

## 環境変数

| 変数名          | 必須 | 説明                             |
| --------------- | ---- | -------------------------------- |
| REDMINE_API_KEY | はい | Redmine の API キー              |
| REDMINE_URL     | はい | Redmine インスタンスのベース URL |

## トラブルシューティング

<!--
  ACTION REQUIRED: よくある問題とその解決策をここに記載してください。
-->

## 開発

### 開発環境のセットアップ

```bash
# 依存関係のインストール
bun install

# 開発モードでテストを実行
bun test --watch

# ビルド
bun run build
```

### コードスタイル

- TypeScript を使用
- 統一エラーハンドリング戦略に準拠

## ライセンス

ISC

## 参考リンク

- [MCP Inspector ガイド](./MCP_INSPECTOR_GUIDE.md)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Redmine API ドキュメント](https://www.redmine.org/projects/redmine/wiki/rest_api)
- [Bun ドキュメント](https://bun.sh/docs)

## 貢献

このプロジェクトは個人プロジェクトです。問題や改善提案がある場合は、Issue を作成してください。

---

**注意**: このプロジェクトは `bun link` を使用したローカル開発環境での利用を想定しています。npm への公開は想定していません。
