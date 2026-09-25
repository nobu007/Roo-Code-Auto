# Repository relations

Repository: Roo-Code-Auto

## 階層関係（エスカレーション経路）

- 親: business_operation_notes（jinno確定 2026-09-26）
- 根拠: 上流 RooVetGit/Roo-Code の fork。上流比 6 コミット先行し GitHub LM テストハーネス新設（IPC 登録）・docker-compose IPC socket・zero-trust ポリシーを追加。全リポ共通の開発自動化ツールのため business_operation_notes 配下（出典: git log up/main..main、fork 調査 2026-09-26）
- 出典: contracts registry `registry/organization/repositories/roo-code-auto.yaml` の spec.parent（contracts commit ecbc226）。2026-09-26 の一括レビュー表 output/repo-parent-review-2026-09-26.md（ローカル output ディレクトリ）を jinno が現状案で承認。

- Observation: 以前の推定草案（jinno確定待ち）は 2026-09-26 の一括レビューで現状案のまま確定された。provider/consumer の検証済み関係はまだない。
