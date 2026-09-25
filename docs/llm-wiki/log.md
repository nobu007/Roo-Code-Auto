# GoalDev Log

永続的決定と完了記録を追記する。各エントリに日付と検証を必ず付ける
（原則: contracts `llm-wiki-discipline` の log-is-append-with-correction）。

## 2026-09-26 — llm-wiki スキャフォールド

contracts の llm-wiki-discipline 原則に基づき `docs/llm-wiki/` を新設した。

- **Verification**: 原則 `registry/principles/llm-wiki-discipline.yaml`（contracts リポ commit 3ab5768）。

## 2026-09-26 — fork カスタマイズ調査（upstream RooVetGit/Roo-Code）

比較は上流 main と現在ブランチ tas/auto-care/20260830 で実施し 6 コミット先行。内容は GitHub LM テストハーネス新設（src/utils/github-lm-test.ts +240 行、src/activate/registerCommands.ts へ IPC コマンド登録、test-github-lm-commands.md）、docker-compose.yml の IPC socket パス追加、zero-trust パッケージインストールポリシー、llm-wiki 追加。なお上流は up（RooVetGit/Roo-Code）と upstream・RooCodeInc（RooCodeInc/Roo-Code＝同一リポの移転先 org）の 3 名義で登録済み。

- **Verification**: git log up/main..HEAD = 6 commits, diff --stat 要点: src/utils/github-lm-test.ts +240 行、registerCommands.ts +79 行、58 files changed +2738/−25（fetch 不実施・既存参照のみ使用）。

## 2026-09-26 — 親の確定（jinno確定）

- relations.md の階層関係を草案から確定版へ更新。親: business_operation_notes。
- Verification: contracts registry `organization/repositories/roo-code-auto.yaml` の spec.parent（ecbc226）と突合し一致を確認。
