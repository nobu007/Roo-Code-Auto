# GitHub LM テスト実行ガイド

このガイドでは、Roo CodeでGitHub LM（Copilot）をテストする方法を説明します。

## 前提条件

1. **GitHub Copilot拡張機能** がVSCodeにインストール済み
2. **GitHub Copilotにログイン済み** かつ有効なサブスクリプション
3. **Roo Code拡張機能** が開発モードまたはインストール済み

## テスト方法

### 1. VSCodeコマンドパレットを使用

1. `Ctrl+Shift+P` (Windows/Linux) または `Cmd+Shift+P` (Mac) でコマンドパレットを開く
2. 以下のコマンドのいずれかを実行：

#### 基本テスト

```
> Test GitHub LM
```

- GitHub Copilotモデルを検出
- 簡単なコーディングタスクを実行
- レスポンスを確認

#### 複数モデルテスト

```
> Test Multiple GitHub Models
```

- 利用可能な全GitHub/Copilotモデルをテスト
- 各モデルの動作を確認

#### Roo Code設定テスト

```
> Test Roo Code GitHub Configuration
```

- Roo Code形式の設定でテスト
- 実際の使用シナリオを再現

### 2. 期待される結果

#### 成功時の出力例

````
=== Actual GitHub LM Test ===
1. Checking available models...
Found 3 total models
Found 2 GitHub/Copilot models:
  1. copilot/gpt-4o
     ID: copilot-gpt-4o
     Version: 1.0
     Max Input Tokens: 128000
  2. copilot/gpt-4
     ID: copilot-gpt-4
     Version: 1.0
     Max Input Tokens: 8192

2. Testing with model: copilot/gpt-4o
3. Sending test message...
Sending request to GitHub LM...
4. Receiving response...
Here's a simple TypeScript function that adds two numbers:

```typescript
function addNumbers(a: number, b: number): number {
  return a + b;
}
````

✅ Test completed successfully!
Received 15 chunks
Total response length: 156 characters

```

#### エラー時の対処

**No GitHub/Copilot models found**
```

❌ No GitHub/Copilot models found!
Make sure:

- GitHub Copilot extension is installed
- You are signed in to GitHub Copilot
- GitHub Copilot subscription is active

````

**対処方法:**
1. GitHub Copilot拡張機能を確認・インストール
2. VSCodeでGitHub Copilotにログイン
3. GitHub Copilotサブスクリプションを確認

### 3. Roo Codeでの実際の使用

テストが成功したら、Roo Codeの設定で以下を行う：

1. **プロバイダー選択**: "VS Code LM API" を選択
2. **モデル選択**: テストで確認されたcopilotモデルを選択
3. **設定保存**: 設定を保存してRoo Codeで利用開始

#### 推奨設定例
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
````

## トラブルシューティング

### よくある問題

1. **"LanguageModelError"**

    - GitHub Copilotの認証を確認
    - VSCodeを再起動

2. **"No permissions"**

    - GitHub Copilotからログアウトして再ログイン
    - 拡張機能を無効化・有効化

3. **"Model not found"**
    - 利用可能なモデル一覧を確認
    - vendor/familyの組み合わせを調整

### デバッグ情報の確認

1. **Output Channel**: テスト実行時に自動的に開かれる
2. **Developer Console**: `Help > Toggle Developer Tools`
3. **VSCode Log**: `Help > Open Extension Host Log`

### 手動テスト

プログラムによるテストが失敗する場合：

```typescript
// VSCodeの開発者コンソールで実行
const models = await vscode.lm.selectChatModels()
console.log("All models:", models)

const copilotModels = models.filter((m) => m.vendor === "copilot" || m.vendor === "github")
console.log("Copilot models:", copilotModels)
```

## 成功時の次のステップ

1. **Roo Code設定**: テストで確認されたモデルを設定
2. **実際の使用**: コーディングタスクでGitHub Copilotを利用
3. **パフォーマンス確認**: レスポンス速度と品質を評価

## サポート

問題が解決しない場合：

1. GitHub Copilot拡張機能のドキュメントを確認
2. Roo Codeのissueトラッカーで報告
3. VSCode LM APIの公式ドキュメントを参照

---

**注意**: GitHub Copilotは有料サービスです。適切なライセンスとサブスクリプションが必要です。
