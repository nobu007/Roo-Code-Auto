# GitHub LM テストコマンドの実行手順

## 前提条件の確認

1. **GitHub Copilot拡張機能の確認**

    - VSCodeで Extensions → "GitHub Copilot" を検索
    - インストール済みかつ有効化されていることを確認

2. **GitHub Copilotへのログイン確認**

    - Command Palette (`Ctrl+Shift+P`) を開く
    - "GitHub Copilot: Sign In" または "GitHub Copilot: Sign Out" を検索
    - ログイン状態を確認

3. **有効なサブスクリプション確認**
    - GitHub Copilotの有料プランに加入していることを確認

## テスト手順

### ステップ1: コマンドの存在確認

1. VSCodeでCommand Palette (`Ctrl+Shift+P`) を開く
2. "Test GitHub" と入力
3. 以下のコマンドが表示されることを確認：
    - `Test GitHub LM`
    - `Test Multiple GitHub Models`
    - `Test Roo Code GitHub Configuration`

### ステップ2: 基本テストの実行

1. Command Palette で `Test GitHub LM` を実行
2. "GitHub LM Test" Output Channel が自動的に開かれる
3. 以下のような出力が表示されることを期待：

```
Starting GitHub LM test...
=== Actual GitHub LM Test ===
1. Checking available models...
Found X total models
Found Y GitHub/Copilot models:
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
[実際のGitHub Copilotからのレスポンス]

✅ Test completed successfully!
   Received X chunks
   Total response length: Y characters
```

### ステップ3: 複数モデルテストの実行

1. Command Palette で `Test Multiple GitHub Models` を実行
2. "GitHub LM Multi Test" Output Channel が開かれる
3. 利用可能な各モデルでのテスト結果が表示される

### ステップ4: Roo Code設定テストの実行

1. Command Palette で `Test Roo Code GitHub Configuration` を実行
2. "GitHub LM Config Test" Output Channel が開かれる
3. 各設定パターンでのテスト結果が表示される

## 期待される結果

### 成功時

- 各テストが正常に完了
- GitHub Copilotからのレスポンスが表示
- エラーメッセージなし

### エラーパターンと対処

#### "No GitHub/Copilot models found"

**原因**: GitHub Copilot拡張機能が正しく設定されていない
**対処**:

- GitHub Copilot拡張機能のインストール確認
- GitHub Copilotへのログイン確認
- サブスクリプションの確認

#### "LanguageModelError"

**原因**: 認証またはアクセス権限の問題
**対処**:

- GitHub Copilotからログアウト→再ログイン
- VSCodeの再起動

#### テストコマンドが見つからない

**原因**: 拡張機能が正しくビルド・読み込まれていない
**対処**:

- 拡張機能の再読み込み
- VSCode Developer Tools でエラー確認

## 成功後の次のステップ

テストが成功したら：

1. **Roo Code設定画面を開く**
2. **Provider を "VS Code LM API" に設定**
3. **Model で検出されたcopilotモデルを選択**
4. **設定保存**
5. **実際のコーディングタスクでテスト**

## デバッグ情報

問題が発生した場合：

1. **Developer Tools を開く**: `Help > Toggle Developer Tools`
2. **Console タブでエラー確認**
3. **Output Channel "GitHub LM Test" でログ確認**
4. **Extension Host Log**: `Help > Open Extension Host Log`

---

**注意**: GitHub Copilotは有料サービスです。適切なライセンスが必要です。
