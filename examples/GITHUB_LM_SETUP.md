# GitHub LM (Copilot) Setup Guide for Roo Code

このガイドでは、Roo CodeでGitHub Copilotを使用する方法を説明します。

## 前提条件

1. **GitHub Copilot拡張機能** がVSCodeにインストールされている
2. **GitHub Copilotサブスクリプション** が有効
3. **VSCodeでGitHub Copilotにログイン済み**

## 設定手順

### 1. GitHub Copilot拡張機能の確認

```bash
# VSCodeでGitHub Copilot拡張機能がインストールされていることを確認
# Extensions → "GitHub Copilot" で検索
```

### 2. Roo Code設定

1. **プロバイダー選択**: `VS Code LM API` を選択
2. **モデル選択**: copilotモデル（例: `copilot/gpt-4o`）を選択

### 3. 設定ファイル例

```json
{
	"apiProvider": "vscode-lm",
	"vsCodeLmModelSelector": {
		"vendor": "copilot",
		"family": "gpt-4o"
	},
	"modelTemperature": 0.7,
	"includeMaxTokens": true,
	"diffEnabled": true
}
```

## 使用方法

### プログラムでの使用

```typescript
import { githubLmSample, listAvailableModels } from "./github-lm-sample"

// 利用可能なモデルを確認
await listAvailableModels()

// GitHub LMをテスト
await githubLmSample()
```

### VSCodeコマンドでの使用

```typescript
// package.jsonのcontributesセクションに追加
"commands": [
  {
    "command": "roo-code.testGithubLm",
    "title": "Test GitHub LM"
  },
  {
    "command": "roo-code.listLmModels",
    "title": "List LM Models"
  }
]
```

## トラブルシューティング

### モデルが見つからない場合

```typescript
// 利用可能なモデルを確認
const models = await vscode.lm.selectChatModels()
console.log(
	"Available models:",
	models.map((m) => `${m.vendor}/${m.family}`),
)

// Copilotモデルを検索
const copilotModels = models.filter(
	(m) => m.vendor === "copilot" || m.vendor === "github" || m.family.includes("copilot"),
)
```

### よくある問題と解決方法

1. **"No models found"**

    - GitHub Copilot拡張機能がインストールされていない
    - GitHub Copilotにログインしていない
    - サブスクリプションが無効

2. **"No permissions"**

    - VSCodeでGitHub Copilotからログアウトして再ログイン
    - VSCodeの再起動

3. **"Model not available"**
    - 指定したvendor/familyが存在しない
    - 利用可能なモデル一覧を確認する

## 実際のモデル名例

環境によって利用可能なモデルは異なりますが、一般的な例：

```typescript
// よく見られるGitHub Copilotモデル
const commonSelectors = [
	{ vendor: "copilot", family: "gpt-4o" },
	{ vendor: "copilot", family: "gpt-4" },
	{ vendor: "github", family: "copilot" },
	{ vendor: "copilot", family: "claude" }, // 一部環境
]
```

## 設定の確認

### Roo Code UI での確認手順

1. Roo Code設定を開く
2. "Provider" セクションで "VS Code LM API" を選択
3. "Model" セクションでcopilotモデルが表示されることを確認
4. 適切なモデルを選択

### デバッグ用コード

```typescript
// Roo Code設定の確認
const config = {
	apiProvider: "vscode-lm",
	vsCodeLmModelSelector: {
		vendor: "copilot",
		family: "gpt-4o",
	},
}

// 設定が正しく動作するかテスト
const handler = new VsCodeLmHandler(config)
const response = await handler.createMessage("Hello", [{ role: "user", content: "Test message" }])
```

## 注意事項

- GitHub Copilotの利用には有効なサブスクリプションが必要
- モデル名は環境により異なる場合がある
- VSCode LM APIの利用にはVSCode環境が必要
- ネットワーク接続が必要

## サポート

問題が解決しない場合：

1. VSCodeのDeveloper Consoleでエラーログを確認
2. GitHub Copilotの拡張機能ログを確認
3. VSCodeとGitHub Copilot拡張機能を最新版に更新
