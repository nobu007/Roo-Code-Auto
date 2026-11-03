# MILESTONES — Roo-Code-Auto 実行用マイルストーン分解

長期計画の正本は [../ORDER.md](../ORDER.md)。本ファイルはその**実行用の分解**であり、
重複管理はしない（歴史的なID・根拠はここに保持する）。各項目の状態遷移は
`Acceptance:` に照らした証拠が確認できたときのみ行う。

正本: [../ORDER.md](../ORDER.md) · 投影: [../REPO_METADATA.json](../REPO_METADATA.json)

## MS-001: 長期計画正本・実行分解・メタデータ投影の整備

Outcome: 長期計画の正本（ORDER.md）と実行用分解（本ファイル）、機械可読投影（REPO_METADATA.json schema_version=1）が同一整合状態で配置され、以後の run が計画を参照・更新できる入口が存在する。
Acceptance: ミッション規定の構造検証スクリプト（VERIFY_PLANNING 相当）が `planning structure verified` を出力すること。再現: REPO_METADATA.json / docs/MILESTONES.md / ORDER.md に対して同スクリプトを実行。
Evidence: 本 commit の作業ツリー上で構造検証スクリプトを実行し合格を確認（出力: planning structure verified; semantic acceptance remains separate）。根拠: OI-20261025-13 run 2026-10-25。
Status: achieved
依存: なし（全項目の前提）。
次: MS-002 へ。

## MS-002: `npm test` ベースラインの検証と記録

Outcome: このリポジトリのテスト基盤（`npm test` = turbo test）の通過・失敗状況が証拠つきで記録され、自律ループの第1候補（落ちるテストを直す）が実質的に機能する基準線が存在する。
Acceptance: `npm test` を実行し、結果（exit code・passed/failed 件数の要約）を本項目の Evidence に日付つきで記録する。全緑なら baseline-green、失敗があれば失敗テスト名を MS-002 配下の追記として列挙する。
Evidence: pending
Status: planned
依存: MS-001。前提条件（ORDER.md 第8節・2026-10-24 run-4a4372aa1364 の記録）: 依存導入まで `turbo: not found` で `npm test` は起動不能。また未追跡ツール状態が残る worktree では before-work 記録が拒否される（`repository_changed_before_definition`）。
次: 約30分の具体的作業として、依存導入後に `npm test` を実行して結果を Evidence へ記録。起動不能・失敗のままの場合は阻害内容を Evidence に記録して終了する。失敗がある場合は LOOP.md 候補順に従い次回以降の run で 1 件ずつ修正する。

## MS-003: upstream（RooCodeInc/Roo-Code）との分岐状況の把握

Outcome: フォークとしての現在地（分岐点・乖離規模・upstream 最新）が記録され、追従要否を owner が判断できる材料が整う。
Acceptance: `git log -1 --format='%H %ci' upstream/main` と `git merge-base main upstream/main` の結果を ORDER.md 第2節または本項目 Evidence に日付つきで記録する。参照が取得できない環境では取得できない旨を明記して記録する。
Evidence: pending
Status: planned
依存: MS-001。network fetch が可能なら `git fetch upstream` 後に再確認（任意）。
次: 記録のうえ、追従要否を owner_decision として持ち上げるかを報告に含める。

## MS-004: 検証済み知識の定置（docs/llm-wiki 最小インデックス）

Outcome: run 間で失われていた検証済み知識が `docs/llm-wiki/` に定置され、次の自律 run が参照できる。
Acceptance: `docs/llm-wiki/index.md` が存在し、検証済みの知識（MS-002 のテストベースライン等）へのリンクを持ち、`docs/llm-wiki/log.md` に日付・検証つきの初回エントリがあること。
Evidence: pending
Status: planned
依存: MS-002（最初の記載対象となる証拠）。
次: MS-002 完了後、別 run または本 run の残時間で最小インデックスを新設する。

---
Plan-Status: in_progress（全項目達成時は ORDER.md 第6節の出口条件を確認のうえ更新）
