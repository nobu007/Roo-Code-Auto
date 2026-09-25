# LLM Wiki

長期圧縮コンテキスト。原則: contracts `llm-wiki-discipline`（手本: defuddle
`docs/llm-wiki/`）。正本を複製せず、検証済み知識を出典付きで圧縮する。

## Verified Knowledge

- 成果物: エディタ常駐型 AI コーディングエージェント「Roo Code」（上流 RooCodeInc/Roo-Code 系）の自動化カスタム。（出典: README.md、package.json）
- カスタマイズ: 上流 RooVetGit/Roo-Code に対し GitHub LM テストハーネス新設（src/utils/github-lm-test.ts +240 行、registerCommands.ts へ IPC コマンド登録）、docker-compose.yml へ IPC socket パス、zero-trust パッケージインストールポリシー、llm-wiki 追加。（出典: git log up/main..HEAD 6 commits / src/utils/github-lm-test.ts, src/activate/registerCommands.ts）
