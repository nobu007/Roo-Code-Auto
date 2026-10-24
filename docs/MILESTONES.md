# Roo-Code-Auto — マイルストーンと小作業

<!-- BEGIN: GENERATED -->

計画基準: 2026-10-24 16:21 JST / `ab2fb112bd1f3a07f7065224cd8733fafad85471`。
長期方針: [LONG_TERM_DIRECTION.md](LONG_TERM_DIRECTION.md)。実装・受入正本: `src/core/task/Task.ts`, `src/core/webview/ClineProvider.ts`, `src/services/checkpoints/`, 該当する unit tests、および実際の task/PR が持つ acceptance criteria。
専任ワーカー: [DOT_WORKER_INSTRUCTIONS.md](DOT_WORKER_INSTRUCTIONS.md)。
状態はこの基準時点の観測であり、実行時に main/PR/run から再確認する。

## 構造と実行する範囲

このリポジトリは Roo Code の VS Code 内 agent task loop、mode/tool、subtask handoff、checkpoint とその表示を担当する。外部 dispatch、provider 容量/費用、GitHub CI/merge、配布は別の責務であり、本波では変更しない。

確認した経路: `new_task` tool → `Task` の親子関係と loop → `ClineProvider` の task stack / parent resume → `subtask_result` → task checkpoint。局所 unit tests は存在するが、この基準レビューでは実行していない。

2026-10-24 の read-only 状態: origin `main` は基準 commit と一致。origin PR #1 (`add-multiple-tasks`) は OPEN / DIRTY、最終更新 2026-09-18、区切り文字による複数 task の逐次開始を提案する。これは既存 `new_task` 委任と同じ能力とは限らず、まだ実装・受入済みに数えない。PR #2 は contributor list の自動更新で本目的外。外部 upstream main は別 commit であり、本計画の基準には混ぜない。

**Milestone M0 — 次の製品作業を、実在する要求と受入条件に結びつける。**
完了ゲート: WP-01 が候補の適否と証拠を報告する。適格な要求・AC・Packet 権限が揃わなければ not_needed とし、実装を捏造しない。

|ID|利用者が得る能力・成果|対象WP|完了ゲート|標準作業枠|
|---|---|---|---|---|
|M0|次の変更が既存挙動と重複せず、明示された利用者要求を満たすか判断できる|WP-01|候補を採用/不採用/入力待ちのいずれかに分類し、コード・PR・テストの根拠と次の操作を示す|1 × 約30分|

依存グラフ: `WP-01 → (要件・権限が揃った場合のみ、新規の Packet 内タスク)`。後続の実装カードは現在の証拠から具体的要求を特定できないため未作成・ready ではない。WP-01 が not_needed なら後続は待ち続けず、M0 を「候補なし/入力待ち」で閉じる。

独立して進められる作業: なし。WP-01 は read-only 判定で、コード変更・外部 PR 更新・他担当成果との競合を起こさない。
1枠×約30分は標準枠の単純和。外部待ち・追加修正・実走超過は別で、暦時間保証や大ゴールの残工数ではない。

## 作業カード

### WP-01 | PR #1 が現在の委任目標に適合するかを判定（約30分）

- **主旨**: 実在する候補を検討し、既存の subtask handoff に重複する実装を始める前に、利用者価値と不足する受入証拠を確定する。
- **ゴール・成果物**: PR #1 の採用/不採用/入力待ちの判定を、この WP の実行結果へ記録する。PR の更新、レビューコメント、issue 作成は行わない。
- **入力・対象**: 起動時の `nobu007/Roo-Code-Auto` `main` と PR #1 の最新状態、PR 差分、`src/core/task/Task.ts`, `src/core/webview/ClineProvider.ts`, `src/core/prompts/tools/new-task.ts`, `src/core/task/__tests__/Task.spec.ts`, `src/core/webview/__tests__/ClineProvider.spec.ts`。
- **作業**: 最新 base/head と状態を読み取る。PR が提案する逐次 multi-input の利用者要求を既存 `new_task` の親子委任と比較する。差分が導入する実際の挙動・既存テスト・未検証境界を列挙する。目的に適合するには PR の説明にない AC が必要かも判定する。
- **完了条件（事前AC）**: (1) 起動時の最新 PR 状態を記録、(2) 既存経路との同一/差異を具体的なソース位置で説明、(3) 見つけた AC/検証不足を明示、(4) 採用・不採用・入力待ちの一つを選び、理由を記録する。どれかが欠けたら未達。
- **必要検証・証拠**: `gh pr view 1 --repo nobu007/Roo-Code-Auto` と `gh pr diff 1 --repo nobu007/Roo-Code-Auto` の現在結果、参照したソース/テスト位置。テスト実行はこの read-only 判定に不要。新しい実装が許可された別 task でのみ、その task の必要な test を実行する。
- **依存・着手条件**: なし。PR #1 が閉鎖/消失/読取不能なら、確認できた結果を報告して not_needed または waiting とする。
- **担当・変更範囲**: Dot は read-only。repo ファイル、GitHub PR、issue、workflow は変更しない。新規実装には本カードを権限根拠として使わない。
- **待ち・失敗・再開**: PR が DIRTY のまま、実際の要求元または受入条件が確認できない場合は入力待ちにし、PR を修復・更新せず、欠けている最小入力を明記する。次回は最新状態から再判定する。
- **条件付き不要の判定**: PR が既に close/merge 済みなら、その最終状態と base 上の該当挙動を確認して not_needed。既存機能で同じ受入条件を満たすことをテストまたは具体的なコード経路で確認した場合も not_needed。

## 完了と再計画

- 1WPは1つの判断。設計が成果のWPなので、コード実装の完了とは扱わない。
- pending/ready/in_progress/waiting/done/not_needed を区別する。done はACと必要な配達ゲートを満たした場合だけ。
- WP-01 は外部待ちを起動しない。PR 状態が変わった場合は最新値を取り直す。既存 test の存在だけで受入完了にしない。
- 条件付き前段 WP-01 が not_needed の場合、M0 は候補なし/入力待ちで終了する。存在しない後段を ready としない。
- 同条件比較は本カードに不要。将来比較が要求されたら、比較対象の取得・判定を独立 WP として定義する。
- 実行時刻・commit/hash・PR/run/backend は実行元から取得する。欠測を0で埋めない。
- runtime 進捗と原証拠は割当元の既存 run/checkpoint 領域に置く。計画 MD を実行日誌にしない。
- 追加修正片は parent WP と同じ AC・対象境界に束縛する。WP-01 から実装へ自動的に拡張しない。
- 目的・資源・保護制約を守り、計画変更の理由と影響する再検証を残す。
- 現在の実行波は WP-01 の判定まで。次の波は、採用された具体的要求、AC、対象、Packet 権限が揃った後にのみ計画し直す。

<!-- END: GENERATED -->
<!-- BEGIN: HUMAN -->
<!-- END: HUMAN -->
