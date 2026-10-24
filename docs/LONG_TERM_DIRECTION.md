# Roo-Code-Auto — 長期方針の見直し

<!-- BEGIN: GENERATED -->

計画確認日: 2026-10-24 16:21 JST。基準: `nobu007/Roo-Code-Auto` の `main` / `ab2fb112bd1f3a07f7065224cd8733fafad85471`。
文書の役割: `AUTOMATION.md` は発火・停止・自動処理の現況、README は製品の利用者向け説明、本書は長期方針、[マイルストーン](MILESTONES.md) は実行候補、[Dot 指示書](DOT_WORKER_INSTRUCTIONS.md) は専任ワーカーの実行規則を持つ。コードとテストは実装・局所受入の正本。

## 目的と変更してはいけない条件

- 目的: 開発者がエディタ内の Roo Code に開発作業を任せ、作業の分解・委任・再開・検証の結果を追えるようにする。根拠は [AUTOMATION.md](../AUTOMATION.md) の fleet 大ゴールと [README.md](../README.md) の autonomous coding agent / task automation の説明。
- 最終的な成果と判定範囲: 依頼された作業が、曖昧な「完了」ではなく、合意した成果・検証・残件を伴って利用者へ戻ること。現在は実利用の完了品質、時間・費用、手動介入量を測る証拠がなく、数値目標は設定しない。
- 保護制約・資源・権限: 現在の実行依頼・ハーネス Packet が与える対象・時間・操作権限を維持する。本計画はコード着手、Dot 起動、worker 数・モデル・予算の増加、commit/公開/merge 権限を追加しない。自動処理と kill switch の現況は [AUTOMATION.md](../AUTOMATION.md) を正本とし、ここで driver を追加しない。
- 他担当/外部システムとの責務境界: このリポジトリは VS Code 内の task、mode、tool、checkpoint とその表示を担当する。GitHub の CI・配布 workflow は既存 workflow、実行許可・fleet dispatch は割当元ハーネス、外部モデル/API は各 provider の責務。これらの運用成功を本リポジトリのコードや文書だけで証明しない。

## 全体構造と現在地

|実際の経路/責務|コード・契約|実装/受入/運転の状態|証拠と観測日|残る原因|
|---|---|---|---|---|
|ユーザー依頼からモデル作業へ|`src/core/task/Task.ts`, `src/core/prompts/tools/index.ts`, `src/core/prompts/tools/new-task.ts`|task loop と `new_task` 呼出し契約は実装済み。対象の既存 unit tests はある。実利用の end-to-end 受入は未確認。|指定基準 commit のソースと `src/core/task/__tests__/Task.spec.ts` を 2026-10-24 に読取。テストは未実行。|親から子への依頼が受入可能な成果・検証条件を必ず運ぶか、実行結果で確認していない。|
|subtask handoff と親再開|`src/core/webview/ClineProvider.ts`, `src/core/task/Task.ts`|親子参照、task stack、subtask result、pause/resume の経路が実装済み。個別境界の unit tests は一部あり。|`src/core/webview/__tests__/ClineProvider.spec.ts`, `src/core/task/__tests__/Task.spec.ts` を 2026-10-24 に読取。テストは未実行。|成功・失敗・キャンセル後に親が正しい状態へ戻る一連の受入証拠が不足。|
|変更の復旧と再開|`src/services/checkpoints/`, `src/core/checkpoints/`|checkpoint の保存・復元実装と service tests がある。実際の中断からの復帰運転は未確認。|`src/services/checkpoints/__tests__/ShadowCheckpointService.spec.ts` を 2026-10-24 に読取。テストは未実行。|task の状態・作業ツリー・会話履歴を合わせた復旧受入が確認されていない。|
|複数独立作業の同時進行|task stack と現在の subtask 経路|独立 task の並列実行・分離・競合解決の実装/受入証拠は今回確認できず、未着手扱い。|上記の task/provider 経路を 2026-10-24 に確認。|同時実行を始める前提となる共有資源・workspace 境界・停止時の整合性が明示されていない。|
|継続実行・外部運用|`AUTOMATION.md`, `.github/workflows/`|`AUTOMATION.md` は 2026-09-15 の観測として cron 0 本と workflow 10 本を記録。専用 `LOOP.md`、常駐 Dot driver は基準 commit に存在しない。起動・通知が運転済みとは扱わない。|`AUTOMATION.md` と基準 commit のファイル一覧を 2026-10-24 に確認。|起動や定時報告は割当元実行基盤の役割。本計画で新しい常駐機構を作らない。|

## 以前の計画から変える判断

|以前の前提・順序|最新の事実|維持/変更/後回し/終了|理由・影響先|
|---|---|---|---|
|自動開発の大ゴールからすぐ複数 task の同時実行へ進める|task delegation、parent stack、checkpoint の実装はあるが end-to-end の受入証拠は未確認|変更: まず現在の handoff・再開境界を証拠で確かめる|同時実行の能力を先に増やすと、既存の成功/失敗/復旧条件を混同する。詳細順序は [マイルストーン](MILESTONES.md) を参照。|
|「複数タスク」入力を長期目的の明確な前進とみなす|`nobu007/Roo-Code-Auto` PR #1 は 2026-09-18 更新、OPEN / DIRTY。差分は区切り文字で逐次実行する変更。現 main に未反映|後回し: PR の存在だけで採用せず、WP-01 で目的適合・重複・受入可能性を判定|これは独立作業の並列化や完了品質を示さない。外部 PR の変更・コメント・merge はこの計画の権限外。|
|成果はコード量または機能数で測れる|repo 内に実利用の完了品質や手動介入量の計測根拠を確認できない|終了: 数値を仮置きしない。将来、明示した利用シナリオと計測権限が得られた場合に設計する|儀礼的計測・架空の成功率を計画へ入れない。|

古い成功・失敗はその候補/条件の記録として保持する。現在の仕様・実績へ付け替えない。基準時点では `main` は指定 commit と一致し、upstream `RooVetGit/Roo-Code` の main は別 commit `b867ec9145750d0ae1ff7f02d35406e9bf2a0b16`。upstream の変更をこの fork の実装済み状態へ混ぜない。

## 到達状態から逆算した段階

|段階|利用者が得る成果|必要な証拠|未達原因・依存|次の実行波に進む条件|
|---|---|---|---|---|
|1. 委任の意味が確認できる|親 task が依頼した子 task の結果を利用者へ説明可能な形で受け取る|対象 issue/依頼の受入条件に沿う handoff・失敗・キャンセルの境界テスト|既存の部分テストと task 全体の受入が対応づけられていない|WP-01 が実在する要求と不足を特定し、Packet が変更権限を与えた場合|
|2. 中断後に安全に戻れる|利用者が停止・失敗から task の状態と成果を失わず続けられる|対象シナリオの checkpoint/restore と親子 task 再開テスト|実装単体の checkpoint テスト以外に統合受入がない|段階1の合格後、具体的な再開シナリオと受入元が確定した場合|
|3. 独立作業を安全に並行できる|作業が分離され、衝突・停止・未完了を正しく可視化できる|独立性・競合・キャンセル・統合を含む受入結果|独立性・workspace 分離・資源上限の契約が未確定|段階1/2の証拠と、明示された並列要件・資源許可を得た場合のみ|
|4. 実利用で自動完了の価値を確認できる|開発者が意図した品質の変更を少ない手動引継ぎで受け取れる|事前合意した利用シナリオの成果・人手介入・失敗記録|現在、計測条件・対象利用者・データ許可がない|責任者がシナリオ、データ取扱い、評価方法を明示した場合|

現在の実行波は [MILESTONES.md](MILESTONES.md) の WP-01 一件。未実証の段階へ詳細実装を作らない。Dot を実際に起動しておらず、計画の作成を製品実装・運転受入として数えない。

<!-- END: GENERATED -->
<!-- BEGIN: HUMAN -->
<!-- END: HUMAN -->
